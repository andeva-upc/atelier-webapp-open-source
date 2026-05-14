import { Injectable, computed, signal, inject } from '@angular/core';
import { retry } from 'rxjs';
import { Appointment, AppointmentStatus } from '../domain/models/appointments.entity';
import { AppointmentRepository } from '../domain/repositories/appointments.repository';

/**
 * Application service managing appointment domain state and orchestration.
 */
@Injectable({ providedIn: 'root' })
export class AppointmentsStore {
  private readonly repository = inject(AppointmentRepository);

  private readonly appointmentsSignal = signal<Appointment[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly savingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly appointments = this.appointmentsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly saving = this.savingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly activeAppointments = computed(() =>
    this.appointments().filter(appointment => !appointment.deletedAt)
  );

  readonly appointmentsCount = computed(() => this.activeAppointments().length);

  readonly confirmedCount = computed(() =>
    this.activeAppointments().filter(appointment => appointment.isConfirmed()).length
  );

  readonly pendingCount = computed(() =>
    this.activeAppointments().filter(appointment => appointment.status === 'PENDING_APPROVAL').length
  );

  readonly completedCount = computed(() =>
    this.activeAppointments().filter(appointment => appointment.status === 'COMPLETED').length
  );

  readonly cancelledCount = computed(() =>
    this.activeAppointments().filter(appointment => appointment.status === 'CANCELLED').length
  );

  loadAppointments(query: string = ''): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const request = query ? this.repository.search(query) : this.repository.getAll();

    request.subscribe({
      next: appointments => {
        this.appointmentsSignal.set(appointments);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.loadingSignal.set(false);
        this.errorSignal.set(this.formatError(err, 'Failed to load appointments'));
      },
    });
  }

  createAppointment(appointment: Appointment, onSuccess?: () => void): void {
    this.savingSignal.set(true);
    this.errorSignal.set(null);

    this.repository.create(appointment).pipe(retry(2)).subscribe({
      next: () => {
        this.savingSignal.set(false);
        this.loadAppointments();
        onSuccess?.();
      },
      error: err => {
        this.savingSignal.set(false);
        this.errorSignal.set(this.formatError(err, 'Failed to create appointment'));
      },
    });
  }

  updateAppointment(appointment: Appointment, onSuccess?: () => void): void {
    this.savingSignal.set(true);
    this.errorSignal.set(null);

    this.repository.update(appointment).pipe(retry(2)).subscribe({
      next: updatedAppointment => {
        this.appointmentsSignal.update(list =>
          list.map(item => item.id === updatedAppointment.id ? updatedAppointment : item)
        );
        this.savingSignal.set(false);
        this.loadAppointments();
        onSuccess?.();
      },
      error: err => {
        this.savingSignal.set(false);
        this.errorSignal.set(this.formatError(err, 'Failed to update appointment'));
      },
    });
  }

  updateStatus(id: string | number, status: AppointmentStatus, version: number): void {
    this.savingSignal.set(true);
    this.errorSignal.set(null);

    this.repository.updateStatus(id, status, version).subscribe({
      next: updatedAppointment => {
        this.appointmentsSignal.update(list =>
          list.map(item => item.id === updatedAppointment.id ? updatedAppointment : item)
        );
        this.savingSignal.set(false);
        this.loadAppointments();
      },
      error: err => {
        this.savingSignal.set(false);
        this.errorSignal.set(this.formatError(err, 'Failed to update appointment status'));
      },
    });
  }

  private formatError(error: any, fallback: string): string {
    if (error instanceof Error) {
      return error.message;
    }
    return fallback;
  }
}
