import { Injectable, computed, signal, inject, Signal } from '@angular/core';
import { retry, Observable } from 'rxjs';
import { Customer } from '../domain/models/customer.entity';
import { CustomerRepository } from '../domain/repositories/customer.repository';

/**
 * Application service managing customers domain state and orchestration.
 * 
 * Coordinates interactions with the infrastructure layer (CustomersApi)
 * and provides reactive state queries via Angular signals.
 */
@Injectable({
  providedIn: 'root',
})
export class CustomersStore {
  /**
   * Reference to the abstract domain repository contract.
   * @private
   */
  private readonly repository = inject(CustomerRepository);

  /**
   * Signal containing all loaded customers.
   * @private
   */
  private readonly customersSignal = signal<Customer[]>([]);

  /**
   * Signal indicating whether data is currently loading.
   * @private
   */
  private readonly loadingSignal = signal<boolean>(false);

  /**
   * Signal indicating whether a save/create operation is in progress.
   * @private
   */
  private readonly savingSignal = signal<boolean>(false);

  /**
   * Signal containing the most recent error message, if any.
   * @private
   */
  private readonly errorSignal = signal<string | null>(null);

  /**
   * Readonly signal for accessing all customers.
   * Emits an array of Customer domain entities.
   */
  readonly customers = this.customersSignal.asReadonly();

  /**
   * Readonly signal for accessing the loading state.
   */
  readonly loading = this.loadingSignal.asReadonly();

  /**
   * Readonly signal for accessing the saving state.
   */
  readonly saving = this.savingSignal.asReadonly();

  /**
   * Readonly signal for accessing the current error state.
   */
  readonly error = this.errorSignal.asReadonly();

  /**
   * Computed signal for accessing non-deleted customers.
   */
  readonly activeCustomers = computed(() => this.customers().filter(c => !c.deletedAt));

  /**
   * Computed signal for the total number of active customers.
   */
  readonly customersCount = computed(() => this.activeCustomers().length);

  /**
   * Formats error messages for display to users or logs.
   * 
   * @param error - The error object to format
   * @param fallback - The fallback message if error format is unknown
   * @returns A human-readable error message
   * @private
   */
  private formatError(error: any, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found') ? `${fallback}: Not found` : error.message;
    }
    return fallback;
  }

  /**
   * Loads customers from the remote API, optionally filtered by search query.
   * 
   * @param query - Optional search query string.
   */
  loadCustomers(query: string = ''): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const apiCall = query ? this.repository.search(query) : this.repository.getAll();

    apiCall.subscribe({
      next: (data) => {
        this.customersSignal.set(data);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(this.formatError(err, 'Failed to load customers'));
      },
    });
  }

  /**
   * Persists a new customer record via the repository and updates state.
   * 
   * @param customer - The customer aggregate instance to create.
   * @param onSuccess - Optional callback triggered on success.
   */
  createCustomer(customer: Customer, onSuccess?: () => void): void {
    this.savingSignal.set(true);
    this.errorSignal.set(null);

    this.repository.create(customer).pipe(retry(2)).subscribe({
      next: (createdCustomer) => {
        this.customersSignal.update((list) => [...list, createdCustomer]);
        this.savingSignal.set(false);
        if (onSuccess) {
          onSuccess();
        }
      },
      error: (err) => {
        this.savingSignal.set(false);
        this.errorSignal.set(this.formatError(err, 'Failed to create customer'));
      },
    });
  }

  /**
   * Performs a soft delete on a customer and updates the local state.
   * 
   * @param id - The ID of the customer to delete.
   */
  deleteCustomer(id: string | number): void {
    this.savingSignal.set(true);
    this.errorSignal.set(null);

    this.repository.delete(id).subscribe({
      next: () => {
        this.customersSignal.update((list) => list.filter(cust => cust.id !== id));
        this.savingSignal.set(false);
      },
      error: (err: any) => {
        this.savingSignal.set(false);
        this.errorSignal.set(this.formatError(err, 'Failed to delete customer'));
      },
    });
  }

  /**
   * Checks for pre-registration matches or existing customers.
   * 
   * @param documentType - The document type filter.
   * @param documentNumber - The document number filter.
   * @param phone - The phone number filter.
   * @returns Observable emitting search results to let UI decide the next step.
   */
  findPreRegistration(
    documentType: string,
    documentNumber: string,
    phone: string
  ): Observable<any> {
    return this.repository.findPreRegistration(documentType, documentNumber, phone);
  }
}

