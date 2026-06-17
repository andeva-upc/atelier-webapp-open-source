import { Injectable, signal } from '@angular/core';
import { FleetApi } from '../infrastructure/fleet-api';

import { AppointmentResponse } from '../infrastructure/responses/appointment.response';
import { CustomerRegistrationResponse } from '../infrastructure/responses/customer-registration.response';

import { CreateAppointmentCommand } from '../domain/model/commands/create-appointment.command';
import { UpdateAppointmentCommand } from '../domain/model/commands/update-appointment.command';
import { CreateCustomerRegistrationCommand } from '../domain/model/commands/create-customer-registration.command';
import { UpdateCustomerRegistrationCommand } from '../domain/model/commands/update-customer-registration.command';

@Injectable({ providedIn: 'root' })
export class FleetStore {

  private readonly appointmentsSignal = signal<AppointmentResponse[]>([]);
  private readonly customerRegistrationsSignal = signal<CustomerRegistrationResponse[]>([]);

  private readonly activeAppointmentSignal = signal<AppointmentResponse | null>(null);
  private readonly activeCustomerRegistrationSignal = signal<CustomerRegistrationResponse | null>(null);

  readonly appointments = this.appointmentsSignal.asReadonly();
  readonly customerRegistrations = this.customerRegistrationsSignal.asReadonly();

  readonly activeAppointment = this.activeAppointmentSignal.asReadonly();
  readonly activeCustomerRegistration = this.activeCustomerRegistrationSignal.asReadonly();

  constructor(private api: FleetApi) {}


  loadAppointmentsByBranchId(branchId: string) {
    this.api.appointments.getByBranchId(branchId).subscribe({
      next: (appointments) => this.appointmentsSignal.set(appointments),
      error: (err) => console.error('Failed to load appointments:', err)
    });
  }

  loadAppointmentById(appointmentId: string) {
    this.api.appointments.getById(appointmentId).subscribe({
      next: (appointment) => this.activeAppointmentSignal.set(appointment),
      error: (err) => console.error('Failed to load appointment:', err)
    });
  }

  createAppointment(command: CreateAppointmentCommand) {
    this.api.appointments.create(command).subscribe({
      next: (appointment) => {
        this.appointmentsSignal.update((list) => [...list, appointment]);
        this.activeAppointmentSignal.set(appointment);
      },
      error: (err) => console.error('Failed to create appointment:', err)
    });
  }

  updateAppointment(appointmentId: string, command: UpdateAppointmentCommand) {
    this.api.appointments.update(appointmentId, command).subscribe({
      next: (appointment) => {
        this.appointmentsSignal.update((list) =>
          list.map((item) => item.id === appointment.id ? appointment : item)
        );
        this.activeAppointmentSignal.set(appointment);
      },
      error: (err) => console.error('Failed to update appointment:', err)
    });
  }

  deleteAppointment(appointmentId: string) {
    this.api.appointments.delete(appointmentId).subscribe({
      next: () => {
        this.appointmentsSignal.update((list) =>
          list.filter((item) => item.id !== appointmentId)
        );

        if (this.activeAppointmentSignal()?.id === appointmentId) {
          this.activeAppointmentSignal.set(null);
        }
      },
      error: (err) => console.error('Failed to delete appointment:', err)
    });
  }

  loadCustomerRegistrationsByBranchId(branchId: string) {
    this.api.customerRegistrations.getByBranchId(branchId).subscribe({
      next: (registrations) => this.customerRegistrationsSignal.set(registrations),
      error: (err) => console.error('Failed to load customer registrations:', err)
    });
  }

  loadCustomerRegistrationsByBranchIdAndStatus(branchId: string, status: string) {
    this.api.customerRegistrations.getByBranchIdAndStatus(branchId, status).subscribe({
      next: (registrations) => this.customerRegistrationsSignal.set(registrations),
      error: (err) => console.error('Failed to load customer registrations by status:', err)
    });
  }

  loadCustomerRegistrationById(registrationId: string) {
    this.api.customerRegistrations.getById(registrationId).subscribe({
      next: (registration) => this.activeCustomerRegistrationSignal.set(registration),
      error: (err) => console.error('Failed to load customer registration:', err)
    });
  }

  createCustomerRegistration(command: CreateCustomerRegistrationCommand) {
    this.api.customerRegistrations.create(command).subscribe({
      next: (registration) => {
        this.customerRegistrationsSignal.update((list) => [...list, registration]);
        this.activeCustomerRegistrationSignal.set(registration);
      },
      error: (err) => console.error('Failed to create customer registration:', err)
    });
  }

  updateCustomerRegistration(registrationId: string, command: UpdateCustomerRegistrationCommand) {
    this.api.customerRegistrations.update(registrationId, command).subscribe({
      next: (registration) => {
        this.customerRegistrationsSignal.update((list) =>
          list.map((item) => item.id === registration.id ? registration : item)
        );
        this.activeCustomerRegistrationSignal.set(registration);
      },
      error: (err) => console.error('Failed to update customer registration:', err)
    });
  }

  deleteCustomerRegistration(registrationId: string) {
    this.api.customerRegistrations.delete(registrationId).subscribe({
      next: () => {
        this.customerRegistrationsSignal.update((list) =>
          list.filter((item) => item.id !== registrationId)
        );

        if (this.activeCustomerRegistrationSignal()?.id === registrationId) {
          this.activeCustomerRegistrationSignal.set(null);
        }
      },
      error: (err) => console.error('Failed to delete customer registration:', err)
    });
  }

}
