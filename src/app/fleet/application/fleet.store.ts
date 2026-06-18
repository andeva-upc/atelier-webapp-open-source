import { Injectable, signal, computed } from '@angular/core';
import { FleetApi } from '../infrastructure/fleet-api';
import { FleetAssemblers } from '../infrastructure/assemblers/fleet-assemblers';
import { Vehicle } from '../domain/model/vehicle.model';
import { Obd2Device, Obd2Registration, TelemetrySnapshot, DtcAlert } from '../domain/model/obd2.model';
import { CreateVehicleCommand } from '../domain/model/commands/create-vehicle.command';
import { LinkObd2DeviceCommand } from '../domain/model/commands/link-obd2-device.command';

import { AppointmentResponse } from '../infrastructure/responses/appointment.response';
import { CustomerRegistrationResponse } from '../infrastructure/responses/customer-registration.response';
import { EmployeeRegistrationResponse } from '../infrastructure/responses/employee-registration.response';

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
  private readonly activeEmployeeRegistrationSignal = signal<EmployeeRegistrationResponse | null>(null);

  readonly appointments = this.appointmentsSignal.asReadonly();
  readonly customerRegistrations = this.customerRegistrationsSignal.asReadonly();

  readonly activeAppointment = this.activeAppointmentSignal.asReadonly();
  readonly activeCustomerRegistration = this.activeCustomerRegistrationSignal.asReadonly();
  readonly activeEmployeeRegistration = this.activeEmployeeRegistrationSignal.asReadonly();

  private readonly vehiclesSignal = signal<Vehicle[]>([]);
  private readonly customerVehiclesSignal = signal<Vehicle[]>([]);
  private readonly obd2DevicesSignal = signal<Obd2Device[]>([]);
  private readonly activeObd2RegistrationsSignal = signal<Obd2Registration[]>([]);
  
  private readonly selectedVehicleTelemetrySignal = signal<TelemetrySnapshot[]>([]);
  private readonly selectedVehicleDtcAlertsSignal = signal<DtcAlert[]>([]);

  readonly vehicles = this.vehiclesSignal.asReadonly();
  readonly customerVehicles = this.customerVehiclesSignal.asReadonly();
  readonly obd2Devices = this.obd2DevicesSignal.asReadonly();
  readonly activeObd2Registrations = this.activeObd2RegistrationsSignal.asReadonly();
  
  readonly selectedVehicleTelemetry = this.selectedVehicleTelemetrySignal.asReadonly();
  readonly selectedVehicleDtcAlerts = this.selectedVehicleDtcAlertsSignal.asReadonly();

  readonly availableObd2Devices = computed(() => {
    return this.obd2DevicesSignal().filter(d => d.status === 'AVAILABLE');
  });

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

  loadAppointmentsByVehicleId(vehicleId: string) {
    this.api.appointments.getByVehicleId(vehicleId).subscribe({
      next: (appointments) => this.appointmentsSignal.set(appointments),
      error: (err) => console.error('Failed to load appointments by vehicle:', err)
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

  loadEmployeeRegistrationById(employeeId: string) {
    this.api.employeeRegistrations.getById(employeeId).subscribe({
      next: (registration) => this.activeEmployeeRegistrationSignal.set(registration),
      error: (err) => console.error('Failed to load employee registration:', err)
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

  // ==========================================
  // VEHICLES & OBD2
  // ==========================================

  loadAvailableVehicles() {
    this.api.vehicles.getAvailableForLinking().subscribe({
      next: (responses) => this.vehiclesSignal.set(FleetAssemblers.toVehicleArray(responses)),
      error: (err) => console.error('Failed to load available vehicles:', err)
    });
  }

  loadCustomerVehicles(customerId: string) {
    this.api.customerVehicles.getByCustomerId(customerId).subscribe({
      next: (responses) => this.customerVehiclesSignal.set(FleetAssemblers.toVehicleArray(responses)),
      error: (err) => console.error('Failed to load customer vehicles:', err)
    });
  }

  loadObd2Devices() {
    this.api.obd2Devices.getAll().subscribe({
      next: (responses) => this.obd2DevicesSignal.set(FleetAssemblers.toObd2DeviceArray(responses)),
      error: (err) => console.error('Failed to load obd2 devices:', err)
    });
  }

  loadActiveObd2Registrations() {
    this.api.obd2Registrations.getAll().subscribe({
      next: (responses) => this.activeObd2RegistrationsSignal.set(FleetAssemblers.toObd2RegistrationArray(responses)),
      error: (err) => console.error('Failed to load active obd2 registrations:', err)
    });
  }

  loadVehicleTelemetry(vehicleId: string) {
    this.api.vehicles.getTelemetrySnapshots(vehicleId).subscribe({
      next: (responses) => this.selectedVehicleTelemetrySignal.set(FleetAssemblers.toTelemetrySnapshotArray(responses)),
      error: (err) => console.error('Failed to load vehicle telemetry:', err)
    });
  }

  loadVehicleDtcAlerts(vehicleId: string) {
    this.api.vehicles.getDtcAlerts(vehicleId).subscribe({
      next: (responses) => this.selectedVehicleDtcAlertsSignal.set(FleetAssemblers.toDtcAlertArray(responses)),
      error: (err) => console.error('Failed to load vehicle dtc alerts:', err)
    });
  }

  registerVehicle(command: CreateVehicleCommand) {
    this.api.vehicles.register(command).subscribe({
      next: (response) => {
        const vehicle = FleetAssemblers.toVehicle(response);
        this.vehiclesSignal.set([...this.vehiclesSignal(), vehicle]);
      },
      error: (err) => console.error('Failed to register vehicle:', err)
    });
  }

  updateVehicle(id: string, command: any) {
    this.api.vehicles.update(id, command).subscribe({
      next: (response) => {
        const updated = FleetAssemblers.toVehicle(response);
        this.vehiclesSignal.update(list => list.map(v => v.id === id ? updated : v));
      },
      error: (err) => console.error('Failed to update vehicle:', err)
    });
  }

  deleteVehicle(id: string) {
    this.api.vehicles.delete(id).subscribe({
      next: () => {
        this.vehiclesSignal.update(list => list.filter(v => v.id !== id));
      },
      error: (err) => console.error('Failed to delete vehicle:', err)
    });
  }

  linkObd2Device(command: LinkObd2DeviceCommand) {
    this.api.obd2Registrations.linkDevice(command).subscribe({
      next: (response) => {
        const registration = FleetAssemblers.toObd2Registration(response);
        this.activeObd2RegistrationsSignal.set([...this.activeObd2RegistrationsSignal(), registration]);
        this.loadObd2Devices();
      },
      error: (err) => console.error('Failed to link obd2 device:', err)
    });
  }

  deactivateObd2Registration(registrationId: string) {
    this.api.obd2Registrations.deactivate(registrationId).subscribe({
      next: () => {
        const updated = this.activeObd2RegistrationsSignal().filter(r => r.id !== registrationId);
        this.activeObd2RegistrationsSignal.set(updated);
        this.loadObd2Devices();
      },
      error: (err) => console.error('Failed to deactivate registration:', err)
    });
  }

  // ==========================================
  // OBD2 DEVICES MUTATORS
  // ==========================================
  
  registerObd2Device(command: any) {
    this.api.obd2Devices.register(command).subscribe({
      next: (response) => {
        const device = FleetAssemblers.toObd2Device(response);
        this.obd2DevicesSignal.update(list => [...list, device]);
      },
      error: (err) => console.error('Failed to register obd2 device:', err)
    });
  }

  updateObd2Device(id: string, command: any) {
    this.api.obd2Devices.update(id, command).subscribe({
      next: (response) => {
        const updated = FleetAssemblers.toObd2Device(response);
        this.obd2DevicesSignal.update(list => list.map(d => d.id === id ? updated : d));
      },
      error: (err) => console.error('Failed to update obd2 device:', err)
    });
  }

  deleteObd2Device(id: string) {
    this.api.obd2Devices.delete(id).subscribe({
      next: () => {
        this.obd2DevicesSignal.update(list => list.filter(d => d.id !== id));
      },
      error: (err) => console.error('Failed to delete obd2 device:', err)
    });
  }
}
