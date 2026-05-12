import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled';
type AppointmentFilter = 'all' | AppointmentStatus;

interface Appointment {
  id: number;
  client: string;
  vehicle: string;
  date: string;
  time: string;
  mechanic: string;
  service: string;
  status: AppointmentStatus;
  isToday: boolean;
}

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments-list.html',
  styleUrl: './appointments-list.css',
})
export class AppointmentsList {
  readonly activeFilter = signal<AppointmentFilter>('all');
  readonly isModalOpen = signal<boolean>(false);

  readonly appointments = signal<Appointment[]>([
    {
      id: 1,
      client: 'Ana Torres',
      vehicle: 'Chevrolet Spark JKL-012',
      date: '2026-05-08',
      time: '09:00',
      mechanic: 'Luis P.',
      service: 'Revisión general',
      status: 'confirmed',
      isToday: true,
    },
    {
      id: 2,
      client: 'Luis Huanca',
      vehicle: 'Honda Civic MNO-345',
      date: '2026-05-08',
      time: '14:00',
      mechanic: 'Carlos R.',
      service: 'Diagnóstico',
      status: 'pending',
      isToday: true,
    },
    {
      id: 3,
      client: 'María García',
      vehicle: 'Hyundai Tucson XYZ-789',
      date: '2026-05-09',
      time: '10:00',
      mechanic: 'Miguel T.',
      service: 'Cambio de aceite',
      status: 'confirmed',
      isToday: false,
    },
    {
      id: 4,
      client: 'Juan Pérez',
      vehicle: 'Toyota Corolla ABX-432',
      date: '2026-05-10',
      time: '11:00',
      mechanic: 'Carlos R.',
      service: 'Revisión de frenos',
      status: 'pending',
      isToday: false,
    },
    {
      id: 5,
      client: 'Carmen López',
      vehicle: 'Ford Explorer GHI-789',
      date: '2026-05-12',
      time: '09:30',
      mechanic: 'Luis P.',
      service: 'Mantenimiento 20k km',
      status: 'confirmed',
      isToday: false,
    },
  ]);

  readonly totalAppointments = computed(() => this.appointments().length);

  readonly confirmedAppointments = computed(() =>
    this.appointments().filter((appointment) => appointment.status === 'confirmed').length
  );

  readonly pendingAppointments = computed(() =>
    this.appointments().filter((appointment) => appointment.status === 'pending').length
  );

  readonly todayAppointments = computed(() =>
    this.appointments().filter((appointment) => appointment.isToday).length
  );

  readonly filteredAppointments = computed(() => {
    const filter = this.activeFilter();

    if (filter === 'all') {
      return this.appointments();
    }

    return this.appointments().filter((appointment) => appointment.status === filter);
  });

  readonly newAppointment = {
    client: '',
    phone: '',
    vehicle: '',
    service: '',
    date: '',
    time: '',
    mechanic: '',
  };

  setFilter(filter: AppointmentFilter): void {
    this.activeFilter.set(filter);
  }

  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.resetForm();
  }

  addAppointment(): void {
    if (
      !this.newAppointment.client ||
      !this.newAppointment.vehicle ||
      !this.newAppointment.service ||
      !this.newAppointment.date ||
      !this.newAppointment.time ||
      !this.newAppointment.mechanic
    ) {
      return;
    }

    const appointment: Appointment = {
      id: Date.now(),
      client: this.newAppointment.client,
      vehicle: this.newAppointment.vehicle,
      date: this.newAppointment.date,
      time: this.newAppointment.time,
      mechanic: this.newAppointment.mechanic,
      service: this.newAppointment.service,
      status: 'pending',
      isToday: this.newAppointment.date === '2026-05-08',
    };

    this.appointments.update((appointments) => [appointment, ...appointments]);
    this.closeModal();
  }

  getStatusLabel(status: AppointmentStatus): string {
    const labels: Record<AppointmentStatus, string> = {
      confirmed: 'Confirmada',
      pending: 'Pendiente',
      cancelled: 'Cancelada',
    };

    return labels[status];
  }

  private resetForm(): void {
    this.newAppointment.client = '';
    this.newAppointment.phone = '';
    this.newAppointment.vehicle = '';
    this.newAppointment.service = '';
    this.newAppointment.date = '';
    this.newAppointment.time = '';
    this.newAppointment.mechanic = '';
  }
}