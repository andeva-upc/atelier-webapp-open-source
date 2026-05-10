import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matMailOutline } from '@ng-icons/material-icons/outline';
import { 
  matPhoneAndroid, 
  matDirectionsCar, 
  matSearch, 
  matPersonSearch,
  matBadge,
  matFingerprint,
  matCheckCircle,
  matSms,
  matWarning,
  matArrowForward
} from '@ng-icons/material-icons/baseline';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { CustomersStore } from '../../application/customers.store';
import { Customer } from '../../domain/models/customer.entity';
import { Modal } from '../../../shared/presentation/modal/modal';

/**
 * Presentation component representing the Customers overview page.
 * 
 * Uses standard Angular 21 Standalone architecture and reactive Signals
 * to manage view state (customers list, loading state, search queries, and dynamic modal forms)
 * while optimizing rendering cycles with default reactive bindings.
 */
@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    NgIcon,
    Modal
  ],
  providers: [
    provideIcons({ 
      matMailOutline, 
      matPhoneAndroid, 
      matDirectionsCar, 
      matSearch, 
      matPersonSearch,
      matBadge,
      matFingerprint,
      matCheckCircle,
      matSms,
      matWarning,
      matArrowForward
    })
  ],
  templateUrl: './customers.html',
  styleUrl: './customers.css'
})
export class Customers implements OnInit {
  private readonly store = inject(CustomersStore);
  private readonly destroyRef = inject(DestroyRef);

  /** Signal containing the collection of retrieved customer entities */
  readonly customers = this.store.customers;

  /** Signal reflecting the loading/fetching progress */
  readonly isLoading = this.store.loading;

  /** Signal storing the current search string */
  readonly searchQuery = signal<string>('');

  /** Computed signal determining the total number of customers */
  readonly totalCustomersCount = this.store.customersCount;

  /** Signal to toggle the new customer creation modal */
  readonly isModalOpen = signal<boolean>(false);

  /** Signal for the local link sending simulation state */
  private readonly isSendingLinkSignal = signal<boolean>(false);

  /** Signal displaying the save loader state (both for creation and link sending) */
  readonly isSaving = computed(() => this.store.saving() || this.isSendingLinkSignal());

  /** Signals representing the multi-step state machine of the smart modal */
  readonly modalStep = signal<'SEARCH' | 'EXISTING' | 'PRE_REGISTERED' | 'NOT_FOUND' | 'MANUAL_BYPASS'>('SEARCH');

  /** Signal indicating background query progress */
  readonly isSearchingRecord = signal<boolean>(false);

  /** Signal storing retrieved pre-registration data */
  readonly preRegisteredData = signal<any>(null);

  /** Signal storing existing customer data in case of matches */
  readonly existingCustomerData = signal<any>(null);

  /** Signal confirming SMS/WhatsApp link simulated dispatch status */
  readonly smsSent = signal<boolean>(false);

  /** Form Group managing the reactive validation of the new customer */
  readonly customerForm = new FormGroup({
    documentType: new FormControl<'DNI' | 'RUC' | 'CE' | 'PASSPORT'>('DNI', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    documentNumber: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern('^[0-9]{8}$')]
    }),
    fullName: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)]
    }),
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    phone: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern('^[0-9]{9}$')]
    })
  });

  /** Debounce search stream for performance optimization */
  private readonly searchSubject = new Subject<string>();

  /**
   * Initializes the component.
   * Sets up the debounced search stream listener, dynamic validators, and triggers the initial data load.
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

    /** Register dynamic validator updates when the selected document type changes */
    this.customerForm.get('documentType')?.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(type => {
      const documentNumberControl = this.customerForm.get('documentNumber');
      if (!documentNumberControl) {
        return;
      }

      documentNumberControl.clearValidators();
      documentNumberControl.addValidators([Validators.required]);

      if (type === 'DNI') {
        documentNumberControl.addValidators([Validators.pattern('^[0-9]{8}$')]);
      } else if (type === 'RUC') {
        documentNumberControl.addValidators([Validators.pattern('^[0-9]{11}$')]);
      } else {
        documentNumberControl.addValidators([Validators.minLength(5), Validators.maxLength(15)]);
      }

      documentNumberControl.updateValueAndValidity();
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
   * Opens the customer creation modal and resets form inputs to defaults.
   */
  openModal(): void {
    this.customerForm.reset({
      documentType: 'DNI',
      documentNumber: '',
      fullName: '',
      email: '',
      phone: ''
    });
    this.modalStep.set('SEARCH');
    this.isSearchingRecord.set(false);
    this.preRegisteredData.set(null);
    this.existingCustomerData.set(null);
    this.smsSent.set(false);
    this.isModalOpen.set(true);
  }

  /**
   * Closes the customer creation modal.
   */
  closeModal(): void {
    this.isModalOpen.set(false);
  }

  /**
   * Triggers an async query to check for pre-registration matches or existing customers in the system.
   */
  onSearchRecord(): void {
    const documentType = this.customerForm.get('documentType')?.value;
    const documentNumberControl = this.customerForm.get('documentNumber');
    const phoneControl = this.customerForm.get('phone');

    const hasDocument = documentNumberControl && documentNumberControl.value && documentNumberControl.value.trim().length > 0;
    const hasPhone = phoneControl && phoneControl.value && phoneControl.value.trim().length > 0;

    if (!hasDocument && !hasPhone) {
      documentNumberControl?.markAsTouched();
      phoneControl?.markAsTouched();
      return;
    }

    if (hasDocument && documentNumberControl?.invalid) {
      documentNumberControl.markAsTouched();
      return;
    }

    if (hasPhone && phoneControl?.invalid) {
      phoneControl.markAsTouched();
      return;
    }

    this.isSearchingRecord.set(true);
    this.smsSent.set(false);

    const docTypeVal = hasDocument && documentType ? documentType : '';
    const docNumVal = hasDocument && documentNumberControl ? documentNumberControl.value : '';
    const phoneVal = hasPhone && phoneControl ? phoneControl.value : '';

    this.store.findPreRegistration(docTypeVal, docNumVal, phoneVal).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (result) => {
        this.isSearchingRecord.set(false);
        if (!result) {
          this.modalStep.set('NOT_FOUND');
          if (!hasPhone) {
            this.customerForm.patchValue({ phone: '' });
          }
        } else if (result.type === 'EXISTING') {
          this.existingCustomerData.set(result.customer);
          this.modalStep.set('EXISTING');
        } else if (result.type === 'PRE_REGISTERED') {
          this.preRegisteredData.set(result);
          this.customerForm.patchValue({
            documentNumber: docNumVal || result.documentNumber || '',
            fullName: result.fullName,
            email: result.email,
            phone: result.phone.replace('+51', '').trim()
          });
          this.modalStep.set('PRE_REGISTERED');
        }
      },
      error: (err) => {
        console.error('Failed to search pre-registration profile', err);
        this.isSearchingRecord.set(false);
      }
    });
  }

  /**
   * Simulates dispatching a WhatsApp self-registration link to the customer.
   */
  sendRegisterLink(): void {
    const phoneControl = this.customerForm.get('phone');
    if (!phoneControl || phoneControl.invalid) {
      phoneControl?.markAsTouched();
      return;
    }

    this.isSendingLinkSignal.set(true);

    setTimeout(() => {
      this.isSendingLinkSignal.set(false);
      this.smsSent.set(true);
    }, 1200);
  }

  /**
   * Shifts the modal step to manual entry in case of absolute contingency.
   */
  enableManualBypass(): void {
    this.modalStep.set('MANUAL_BYPASS');
  }

  /**
   * Handles submission of the reactive creation form.
   * Instantiates a clean domain entity and persists it through the repository layer.
   */
  onSubmit(): void {
    if (this.customerForm.invalid || this.isSaving()) {
      return;
    }

    const formValues = this.customerForm.getRawValue();

    const newCustomer = new Customer(
      crypto.randomUUID(),
      'e26b1580-b3b0-466d-8c10-ca7f62d1c9ef',
      formValues.documentNumber,
      formValues.documentType,
      formValues.fullName,
      formValues.email,
      formValues.phone,
      0,
      'Sin vehículos registrados',
      'Sin visitas registradas',
      1
    );

    this.store.createCustomer(newCustomer, () => {
      this.closeModal();
    });
  }
}
