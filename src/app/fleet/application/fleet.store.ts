import { Injectable, signal } from '@angular/core';
import { FleetApi } from '../infrastructure/fleet-api';

import { AppointmentResource } from '../infrastructure/responses/appointment.response';
import { CustomerRegistrationResource } from '../infrastructure/responses/customer-registration.response';
import { EmployeeRegistrationResource } from '../infrastructure/responses/employee-registration.response';

import { CreateAppointmentCommand } from '../domain/model/commands/create-appointment.command';
import { UpdateAppointmentCommand } from '../domain/model/commands/update-appointment.command';
import { CreateCustomerRegistrationCommand } from '../domain/model/commands/create-customer-registration.command';
import { UpdateCustomerRegistrationCommand } from '../domain/model/commands/update-customer-registration.command';
import { CreateEmployeeRegistrationCommand } from '../domain/model/commands/create-employee-registration.command';
import { UpdateEmployeeRegistrationCommand } from '../domain/model/commands/update-employee-registration.command';

@Injectable({ providedIn: 'root' })
export class FleetStore {
  // --- Signals ---
  private readonly appointmentsSignal = signal<AppointmentResource[]>([]);
  private readonly customerRegistrationsSignal = signal<CustomerRegistrationResource[]>([]);
  private readonly employeeRegistrationsSignal = signal<EmployeeRegistrationResource[]>([]);

  private readonly activeAppointmentSignal = signal<AppointmentResource | null>(null);
  private readonly activeCustomerRegistrationSignal = signal<CustomerRegistrationResource | null>(null);
  private readonly activeEmployeeRegistrationSignal = signal<EmployeeRegistrationResource | null>(null);

  // --- Exposed Readonly Signals ---
  readonly appointments = this.appointmentsSignal.asReadonly();
  readonly customerRegistrations = this.customerRegistrationsSignal.asReadonly();
  readonly employeeRegistrations = this.employeeRegistrationsSignal.asReadonly();

  readonly activeAppointment = this.activeAppointmentSignal.asReadonly();
  readonly activeCustomerRegistration = this.activeCustomerRegistrationSignal.asReadonly();
  readonly activeEmployeeRegistration = this.activeEmployeeRegistrationSignal.asReadonly();

  constructor(private api: FleetApi) {}

  // ==========================================
  // APPOINTMENTS
  // ==========================================

  loadAppointmentsByBranchId(branchId: string) {
    this.api.appointments.getByBranchId(branchId).subscribe({
      next: (appointments) => this.appointmentsSignal.set(appointments),
      error: (err) => console.error('Failed to load appointments:', err)
    });
  }

  loadAppointmentsByBranchIdAndStatus(branchId: string, status: string) {
    this.api.appointments.getByBranchIdAndStatus(branchId, status).subscribe({
      next: (appointments) => this.appointmentsSignal.set(appointments),
      error: (err) => console.error('Failed to load appointments by branch and status:', err)
    });
  }

  loadAppointmentById(appointmentId: string) {
    this.api.appointments.getById(appointmentId).subscribe({
      next: (appointment) => this.activeAppointmentSignal.set(appointment),
      error: (err) => console.error('Failed to load appointment:', err)
    });
  }

  loadAppointmentsByVehicleId(vehicleId: string) {
    this.api.appointments.getByVehicleId(vehicleId).subscribe({
      next: (appointments) => this.appointmentsSignal.set(appointments),
      error: (err) => console.error('Failed to load appointments by vehicle:', err)
    });
  }

  loadAppointmentsByCustomerId(customerId: string) {
    this.api.appointments.getByCustomerId(customerId).subscribe({
      next: (appointments) => this.appointmentsSignal.set(appointments),
      error: (err) => console.error('Failed to load appointments by customer:', err)
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

  // ==========================================
  // CUSTOMER REGISTRATIONS
  // ==========================================

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

  loadCustomerRegistrationByCustomerId(customerId: string) {
    this.api.customerRegistrations.getByCustomerId(customerId).subscribe({
      next: (registration) => this.activeCustomerRegistrationSignal.set(registration),
      error: (err) => console.error('Failed to load customer registration by customer id:', err)
    });
  }

  createCustomerRegistration(command: CreateCustomerRegistrationCommand) {
    console.log('[FleetStore] createCustomerRegistration called with command:', command);
    this.api.customerRegistrations.create(command).subscribe({
      next: (registration) => {
        console.log('[FleetStore] createCustomerRegistration API call success:', registration);
        this.customerRegistrationsSignal.update((list) => [...list, registration]);
        this.activeCustomerRegistrationSignal.set(registration);
      },
      error: (err) => console.error('[FleetStore] Failed to create customer registration API call:', err)
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

  // ==========================================
  // EMPLOYEE REGISTRATIONS
  // ==========================================

  loadEmployeeRegistrationsByBranchId(branchId: string) {
    this.api.employeeRegistrations.getByBranchId(branchId).subscribe({
      next: (registrations) => this.employeeRegistrationsSignal.set(registrations),
      error: (err) => console.error('Failed to load employee registrations:', err)
    });
  }

  loadEmployeeRegistrationsByBranchIdAndStatus(branchId: string, status: string) {
    this.api.employeeRegistrations.getByBranchIdAndStatus(branchId, status).subscribe({
      next: (registrations) => this.employeeRegistrationsSignal.set(registrations),
      error: (err) => console.error('Failed to load employee registrations by status:', err)
    });
  }

  loadEmployeeRegistrationById(registrationId: string) {
    this.api.employeeRegistrations.getById(registrationId).subscribe({
      next: (registration) => this.activeEmployeeRegistrationSignal.set(registration),
      error: (err) => console.error('Failed to load employee registration:', err)
    });
  }

  loadEmployeeRegistrationByEmployeeId(employeeId: string) {
    this.api.employeeRegistrations.getByEmployeeId(employeeId).subscribe({
      next: (registration) => this.activeEmployeeRegistrationSignal.set(registration),
      error: (err) => console.error('Failed to load employee registration by employee id:', err)
    });
  }

  createEmployeeRegistration(command: CreateEmployeeRegistrationCommand) {
    this.api.employeeRegistrations.create(command).subscribe({
      next: (registration) => {
        this.employeeRegistrationsSignal.update((list) => [...list, registration]);
        this.activeEmployeeRegistrationSignal.set(registration);
      },
      error: (err) => console.error('Failed to create employee registration:', err)
    });
  }

  updateEmployeeRegistration(registrationId: string, command: UpdateEmployeeRegistrationCommand) {
    this.api.employeeRegistrations.update(registrationId, command).subscribe({
      next: (registration) => {
        this.employeeRegistrationsSignal.update((list) =>
          list.map((item) => item.id === registration.id ? registration : item)
        );
        this.activeEmployeeRegistrationSignal.set(registration);
      },
      error: (err) => console.error('Failed to update employee registration:', err)
    });
  }

  deleteEmployeeRegistration(registrationId: string) {
    this.api.employeeRegistrations.delete(registrationId).subscribe({
      next: () => {
        this.employeeRegistrationsSignal.update((list) =>
          list.filter((item) => item.id !== registrationId)
        );
        if (this.activeEmployeeRegistrationSignal()?.id === registrationId) {
          this.activeEmployeeRegistrationSignal.set(null);
        }
      },
      error: (err) => console.error('Failed to delete employee registration:', err)
    });
  }
}
