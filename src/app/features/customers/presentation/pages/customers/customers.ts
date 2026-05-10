import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matMailOutline } from '@ng-icons/material-icons/outline';
import { 
  matPhoneAndroid, 
  matDirectionsCar, 
  matSearch, 
  matPersonSearch 
} from '@ng-icons/material-icons/baseline';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { CustomerRepository } from '../../../domain/repositories/customer.repository';
import { Customer } from '../../../domain/models/customer.entity';

/**
 * Presentation component representing the Customers overview page.
 * 
 * Uses standard Angular 21 Standalone architecture and reactive Signals
 * to manage view state (customers list, loading state, and search queries)
 * while optimizing rendering cycles with default reactive bindings.
 */
@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    NgIcon
  ],
  providers: [
    provideIcons({ 
      matMailOutline, 
      matPhoneAndroid, 
      matDirectionsCar, 
      matSearch, 
      matPersonSearch 
    })
  ],
  templateUrl: './customers.html',
  styleUrl: './customers.css'
})
export class Customers implements OnInit {
  private readonly repository = inject(CustomerRepository);
  private readonly destroyRef = inject(DestroyRef);

  /** Signal containing the collection of retrieved customer entities */
  readonly customers = signal<Customer[]>([]);

  /** Signal reflecting the loading/fetching progress */
  readonly isLoading = signal<boolean>(true);

  /** Signal storing the current search string */
  readonly searchQuery = signal<string>('');

  /** Computed signal determining the total number of customers */
  readonly totalCustomersCount = computed(() => this.customers().length);

  /** Debounce search stream for performance optimization */
  private readonly searchSubject = new Subject<string>();

  /**
   * Initializes the component.
   * Sets up the debounced search stream listener and triggers the initial data load.
   */
  ngOnInit(): void {
    /** Listens to search inputs, applying a 300ms debounce before querying the infrastructure layer */
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.loadCustomers(query);
    });

    /** Trigger initial load of customers */
    this.loadCustomers('');
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
   * Fetches the customer list from the repository layer.
   *
   * @param query - Optional search query string.
   */
  private loadCustomers(query: string): void {
    this.isLoading.set(true);
    const apiCall = query ? this.repository.search(query) : this.repository.getAll();

    apiCall.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => {
        this.customers.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to retrieve customer records', err);
        this.isLoading.set(false);
      }
    });
  }
}
