import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

import { AppointmentsStore } from '../../../application/appointments.store';
import { Appointment, AppointmentStatus } from '../../../domain/models/appointments.entity';
import { SharedModalComponent } from '../../../../shared/presentation/modal/modal';
import { AppointmentsForm } from '../appointments-form/appointments-form';

type AppointmentFilter = 'ALL' | 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';

/**
 * Main presentation component for the appointments bounded context.
 */
@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule, SharedModalComponent, AppointmentsForm, TranslatePipe],
  templateUrl: './appointments-list.html',
  styleUrl: './appointments-list.css',
})
export class AppointmentsList implements OnInit {
  private readonly store = inject(AppointmentsStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<string>();

  readonly appointments = this.store.activeAppointments;
  readonly loading = this.store.loading;
  readonly saving = this.store.saving;
  readonly error = this.store.error;

  readonly totalCount = this.store.appointmentsCount;
  readonly confirmedCount = this.store.confirmedCount;
  readonly pendingCount = this.store.pendingCount;
  readonly completedCount = this.store.completedCount;

  readonly selectedFilter = signal<AppointmentFilter>('ALL');
  readonly searchQuery = signal<string>('');
  readonly isFormOpen = signal<boolean>(false);
  readonly isDetailOpen = signal<boolean>(false);
  readonly formMode = signal<'create' | 'edit'>('create');
  readonly selectedAppointment = signal<Appointment | null>(null);

  readonly filteredAppointments = computed(() => {
    const filter = this.selectedFilter();

    return this.appointments().filter((appointment) => {
      if (filter === 'ALL') {
        return true;
      }

      if (filter === 'CONFIRMED') {
        return appointment.isConfirmed();
      }

      if (filter === 'PENDING') {
        return appointment.status === 'PENDING_APPROVAL';
      }

      if (filter === 'CANCELLED') {
        return appointment.status === 'CANCELLED';
      }

      return appointment.status === 'COMPLETED';
    });
  });

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((query) => {
        this.searchQuery.set(query);
        this.store.loadAppointments(query);
      });

    this.store.loadAppointments();
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value.trim());
  }

  selectFilter(filter: AppointmentFilter): void {
    this.selectedFilter.set(filter);
  }

  openCreateForm(): void {
    this.formMode.set('create');
    this.selectedAppointment.set(null);
    this.isFormOpen.set(true);
  }

  openDetail(appointment: Appointment): void {
    this.selectedAppointment.set(appointment);
    this.isDetailOpen.set(true);
  }

  openEditForm(appointment: Appointment | null = this.selectedAppointment()): void {
    if (!appointment) {
      return;
    }

    this.isDetailOpen.set(false);
    this.formMode.set('edit');
    this.selectedAppointment.set(appointment);
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
  }

  closeDetail(): void {
    this.isDetailOpen.set(false);
  }

  saveAppointment(appointment: Appointment): void {
    if (this.formMode() === 'create') {
      this.store.createAppointment(appointment, () => this.closeForm());
      return;
    }

    this.store.updateAppointment(appointment, () => this.closeForm());
  }

  statusLabelKey(status: AppointmentStatus): string {
    const map: Record<AppointmentStatus, string> = {
      SCHEDULED: 'appointments.status.confirmed',
      PENDING_APPROVAL: 'appointments.status.pending',
      IN_PROGRESS: 'appointments.status.confirmed',
      COMPLETED: 'appointments.status.completed',
      CANCELLED: 'appointments.status.cancelled',
    };

    return map[status];
  }

  getStatusClass(status: AppointmentStatus): string {
    const map: Record<AppointmentStatus, string> = {
      SCHEDULED: 'status-confirmed',
      PENDING_APPROVAL: 'status-pending',
      IN_PROGRESS: 'status-confirmed',
      COMPLETED: 'status-completed',
      CANCELLED: 'status-cancelled',
    };

    return map[status];
  }

  trackByAppointmentId(_: number, appointment: Appointment): string {
    return appointment.id;
  }
}