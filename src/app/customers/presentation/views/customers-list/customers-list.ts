import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matMailOutline } from '@ng-icons/material-icons/outline';
import { 
  matPhoneAndroid, 
  matDirectionsCar, 
  matSearch, 
  matPersonSearch,
  matBadge,
  matDelete
} from '@ng-icons/material-icons/baseline';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CustomersStore } from '../../../application/customers.store';
import { SharedModalComponent } from '../../../../shared/presentation/modal/modal';
import { CustomerForm } from '../customer-form/customer-form';

/**
 * Presentation component representing the Customers overview page.
 * 
 * Manages the main layouts: page headers, search filter actions, customer list grid,
 * and delegates the smart registration workflow to the modular CustomerForm component.
 */
@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    NgIcon,
    SharedModalComponent,
    CustomerForm,
    TranslateModule
  ],
  providers: [
    provideIcons({ 
      matMailOutline, 
      matPhoneAndroid, 
      matDirectionsCar, 
      matSearch, 
      matPersonSearch,
      matBadge,
      matDelete
    })
  ],
  templateUrl: './customers-list.html',
  styleUrl: './customers-list.css'
})
export class CustomersList implements OnInit {
  private readonly store = inject(CustomersStore);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  /** Signal containing the collection of active retrieved customer entities */
  readonly customers = this.store.activeCustomers;

  /** Signal reflecting the loading/fetching progress */
  readonly isLoading = this.store.loading;

  /** Signal storing the current search string */
  readonly searchQuery = signal<string>('');

  /** Computed signal determining the total number of customers */
  readonly totalCustomersCount = this.store.customersCount;

  /** Signal to toggle the new customer creation modal */
  readonly isModalOpen = signal<boolean>(false);

  /** Debounce search stream for performance optimization */
  private readonly searchSubject = new Subject<string>();

  /**
   * Initializes the component.
   * Sets up the debounced search stream listener and triggers the initial data load.
   */
  ngOnInit(): void {
    /** Listen to search inputs, applying a 300ms debounce before querying the infrastructure layer */
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.store.loadCustomers(query);
    });

    /** Trigger initial load of customers */
    this.store.loadCustomers('');
  }

  /**
   * Triggers a debounced search query.
   *
   * @param event - The input keyboard event.
   */
  onSearchInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchSubject.next(inputElement.value.trim());
  }

  /**
   * Opens the customer creation modal.
   */
  openModal(): void {
    this.isModalOpen.set(true);
  }

  /**
   * Closes the customer creation modal.
   */
  closeModal(): void {
    this.isModalOpen.set(false);
  }

  /**
   * Triggers background list reload after a customer is saved successfully.
   */
  onCustomerSaved(): void {
    this.closeModal();
    this.store.loadCustomers(this.searchQuery());
  }

  /**
   * Handles the customer deletion request with a simple browser confirmation.
   *
   * @param event - The click event to prevent propagation.
   * @param customerId - The ID of the customer to delete.
   */
  onDeleteCustomer(event: Event, customerId: string): void {
    event.stopPropagation();
    const confirmed = confirm(this.translate.instant('customers.delete-confirm'));
    if (confirmed) {
      this.store.deleteCustomer(customerId);
    }
  }
}
