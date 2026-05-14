import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Appointment, AppointmentStatus } from '../../../domain/models/appointments.entity';

interface AppointmentFormValue {
  customerName: string;
  customerPhone: string;
  vehicleSummary: string;
  serviceType: string;
  date: string;
  time: string;
  mechanicName: string;
  notes: string;
  status: AppointmentStatus;
}

/**
 * Form component used for creating and editing workshop appointments.
 */
@Component({
  selector: 'app-appointments-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointments-form.html',
  styleUrl: './appointments-form.css',
})
export class AppointmentsForm implements OnChanges {
  @Input() appointment: Appointment | null = null;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() saving = false;

  @Output() readonly save = new EventEmitter<Appointment>();
  @Output() readonly cancel = new EventEmitter<void>();

  readonly appointmentForm = new FormGroup({
    customerName: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    customerPhone: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(7)],
    }),
    vehicleSummary: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5)],
    }),
    serviceType: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    date: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    time: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    mechanicName: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    notes: new FormControl<string>('', {
      nonNullable: true,
    }),
    status: new FormControl<AppointmentStatus>('SCHEDULED', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appointment'] || changes['mode']) {
      this.patchForm();
    }
  }

  onSubmit(): void {
  if (this.appointmentForm.invalid || this.saving) {
    this.appointmentForm.markAllAsTouched();

    console.log('Formulario inválido:', this.appointmentForm.getRawValue());
    console.log('Errores:', {
      customerName: this.appointmentForm.controls.customerName.errors,
      customerPhone: this.appointmentForm.controls.customerPhone.errors,
      vehicleSummary: this.appointmentForm.controls.vehicleSummary.errors,
      serviceType: this.appointmentForm.controls.serviceType.errors,
      date: this.appointmentForm.controls.date.errors,
      time: this.appointmentForm.controls.time.errors,
      mechanicName: this.appointmentForm.controls.mechanicName.errors,
      status: this.appointmentForm.controls.status.errors,
    });

    return;
  }

  const value = this.appointmentForm.getRawValue() as AppointmentFormValue;
  const appointmentDate = `${value.date}T${value.time}:00Z`;

  const entity = new Appointment(
    this.appointment?.id ?? crypto.randomUUID(),
    this.appointment?.workshopId ?? 'e26b1580-b3b0-466d-8c10-ca7f62d1c9ef',
    this.appointment?.branchId ?? 'b1ba1580-b3b0-466d-8c10-ca7f62d1c9aa',
    appointmentDate,
    value.status,
    value.customerName,
    value.customerPhone,
    value.vehicleSummary,
    value.serviceType,
    value.mechanicName,
    value.notes,
    this.appointment ? this.appointment.version + 1 : 0,
    this.appointment?.customerId,
    this.appointment?.vehicleId,
    this.appointment?.deletedAt
  );

  this.save.emit(entity);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private patchForm(): void {
    if (!this.appointment) {
      this.appointmentForm.reset({
        customerName: '',
        customerPhone: '',
        vehicleSummary: '',
        serviceType: '',
        date: '',
        time: '',
        mechanicName: '',
        notes: '',
        status: 'SCHEDULED',
      });
      return;
    }

    this.appointmentForm.patchValue({
      customerName: this.appointment.customerName,
      customerPhone: this.appointment.customerPhone,
      vehicleSummary: this.appointment.vehicleSummary,
      serviceType: this.appointment.serviceType,
      date: this.appointment.getDateLabel(),
      time: this.appointment.getTimeLabel(),
      mechanicName: this.appointment.mechanicName,
      notes: this.appointment.notes,
      status: this.appointment.status,
    });
  }
}
