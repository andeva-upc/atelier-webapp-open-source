import { Component, OnInit, signal, computed, inject, DestroyRef, Output, EventEmitter, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matMailOutline } from '@ng-icons/material-icons/outline';
import { 
  matPhoneAndroid, 
  matDirectionsCar, 
  matSearch, 
  matPersonSearch,
  matFingerprint,
  matCheckCircle,
  matSms,
  matWarning,
  matArrowForward
} from '@ng-icons/material-icons/baseline';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { CustomersStore } from '../../../application/customers.store';
import { Customer } from '../../../domain/models/customer.entity';

/**
 * Component managing the multi-step customer registration process.
 * 
 * Includes verification of pre-registration appointments, validation 
 * of various ID formats (DNI, RUC, CE, Passport) or phone numbers,
 * sending of self-registration links, and manual backup entry.
 */
@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgIcon,
    TranslateModule
  ],
  providers: [
    provideIcons({ 
      matMailOutline, 
      matPhoneAndroid, 
      matDirectionsCar, 
      matSearch, 
      matPersonSearch,
      matFingerprint,
      matCheckCircle,
      matSms,
      matWarning,
      matArrowForward
    })
  ],
  templateUrl: './customer-form.html',
  styleUrl: './customer-form.css'
})
export class CustomerForm implements OnInit {
  private readonly store = inject(CustomersStore);
  private readonly destroyRef = inject(DestroyRef);

  /** Event emitted when the customer is successfully created */
  @Output() readonly saved = new EventEmitter<void>();

  /** Event emitted when the creation/searching is canceled */
  @Output() readonly cancel = new EventEmitter<void>();

  /** Signal reflecting the local link sending simulation state */
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
      validators: [Validators.pattern('^[0-9]{8}$')]
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
      validators: [Validators.pattern('^[0-9]{9}$')]
    })
  });

  /** Signal reflecting the form value changes to trigger computed updates */
  private readonly formValue = toSignal(this.customerForm.valueChanges, { initialValue: this.customerForm.value });

  /** Computed signal evaluating if the current search criteria has a valid format for submission */
  readonly isSearchValid = computed(() => {
    // Access formValue to establish reactive dependency on form edits
    this.formValue();
    
    const documentNumberControl = this.customerForm.get('documentNumber');
    const phoneControl = this.customerForm.get('phone');
    
    const hasDocument = !!(documentNumberControl && documentNumberControl.value && documentNumberControl.value.trim().length > 0);
    const hasPhone = !!(phoneControl && phoneControl.value && phoneControl.value.trim().length > 0);

    if (!hasDocument && !hasPhone) {
      return false;
    }

    return !(hasDocument && documentNumberControl?.invalid) && !(hasPhone && phoneControl?.invalid);
  });

  /**
   * Registers dynamic validators and resets state on init.
   */
  ngOnInit(): void {
    /** Register dynamic validator updates when the selected document type changes */
    this.customerForm.get('documentType')?.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.updateValidators());
  }

  /**
   * Dynamically updates validators based on the current modal step and document type.
   * This ensures fields are only required when actually creating/editing, 
   * but remain optional during the search phase.
   */
  private updateValidators(): void {
    const documentType = this.customerForm.get('documentType')?.value;
    const documentNumberControl = this.customerForm.get('documentNumber');
    const phoneControl = this.customerForm.get('phone');

    if (!documentNumberControl || !phoneControl) return;

    // Reset validators for Document Number
    documentNumberControl.clearValidators();
    if (this.modalStep() === 'MANUAL_BYPASS' || this.modalStep() === 'PRE_REGISTERED') {
      documentNumberControl.addValidators([Validators.required]);
    }

    if (documentType === 'DNI') {
      documentNumberControl.addValidators([Validators.pattern('^[0-9]{8}$')]);
    } else if (documentType === 'RUC') {
      documentNumberControl.addValidators([Validators.pattern('^[0-9]{11}$')]);
    } else {
      documentNumberControl.addValidators([Validators.minLength(5), Validators.maxLength(15)]);
    }

    // Reset validators for Phone
    phoneControl.clearValidators();
    if (this.modalStep() === 'MANUAL_BYPASS' || this.modalStep() === 'PRE_REGISTERED' || this.modalStep() === 'NOT_FOUND') {
      phoneControl.addValidators([Validators.required, Validators.pattern('^[0-9]{9}$')]);
    } else {
      phoneControl.addValidators([Validators.pattern('^[0-9]{9}$')]);
    }

    documentNumberControl.updateValueAndValidity({ emitEvent: false });
    phoneControl.updateValueAndValidity({ emitEvent: false });
  }

  constructor() {
    // Re-evaluate validators whenever the modal step changes
    effect(() => {
      this.modalStep();
      this.updateValidators();
    });
  }

  /**
   * Resets form inputs to default state.
   */
  resetForm(): void {
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
      this.saved.emit();
    });
  }
}
