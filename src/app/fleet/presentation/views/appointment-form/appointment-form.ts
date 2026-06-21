import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { AppointmentsApiEndpoint } from '../../../infrastructure/endpoints/appointments.endpoint';
import { CreateAppointmentCommand } from '../../../domain/model/commands/create-appointment.command';
import { UpdateAppointmentCommand } from '../../../domain/model/commands/update-appointment.command';
import { AppointmentResource } from '../../../infrastructure/responses/appointment.response';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './appointment-form.html',
  styleUrls: ['./appointment-form.css']
})
export class AppointmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  private appointmentsEndpoint = inject(AppointmentsApiEndpoint);

  appointmentForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  appointmentId = signal<string | null>(null);

  statuses = ['PENDING', 'COMPLETED', 'CANCELED'];

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.appointmentId.set(id);
      this.loadAppointment(id);
    }
  }

  initForm(): void {
    this.appointmentForm = this.fb.group({
      customerId: ['', Validators.required],
      vehicleId: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      status: ['PENDING'],
      notes: ['']
    });
  }

  loadAppointment(id: string): void {
    this.isLoading.set(true);
    this.appointmentsEndpoint.getById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (appointment: AppointmentResource) => {
          const scheduled = new Date(appointment.scheduledStart);
          const dateStr = scheduled.toISOString().split('T')[0];
          const timeStr = scheduled.toTimeString().substring(0, 5);

          this.appointmentForm.patchValue({
            customerId: appointment.customerId,
            vehicleId: appointment.vehicleId,
            date: dateStr,
            time: timeStr,
            status: appointment.status,
            notes: appointment.notes
          });
        },
        error: (err: any) => console.error('Error loading appointment', err)
      });
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    const formValue = this.appointmentForm.value;
    const branchId = localStorage.getItem('tenantBranchId') || sessionStorage.getItem('tenantBranchId') || '';
    
    const scheduledStart = `${formValue.date}T${formValue.time}:00`;

    this.isSaving.set(true);

    if (this.isEditMode() && this.appointmentId()) {
      const command = new UpdateAppointmentCommand(
        branchId,
        formValue.customerId,
        formValue.vehicleId,
        scheduledStart,
        formValue.status,
        formValue.notes
      );
      this.appointmentsEndpoint.update(this.appointmentId()!, command)
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => this.router.navigate(['/fleet/appointments']),
          error: (err: any) => console.error('Error updating appointment', err)
        });
    } else {
      const command = new CreateAppointmentCommand(
        branchId,
        formValue.customerId,
        formValue.vehicleId,
        scheduledStart,
        formValue.notes
      );
      this.appointmentsEndpoint.create(command)
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => this.router.navigate(['/fleet/appointments']),
          error: (err: any) => console.error('Error creating appointment', err)
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/fleet/appointments']);
  }
}
