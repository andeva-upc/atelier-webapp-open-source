import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IotApi } from '../infrastructure/iot-api';

// Commands
import { CreateObd2DeviceCommand } from '../domain/model/commands/create-obd2-device.command';
import { UpdateObd2DeviceCommand } from '../domain/model/commands/update-obd2-device.command';
import { LinkObd2DeviceCommand } from '../domain/model/commands/link-obd2-device.command';
import { RegisterVehicleCommand } from '../domain/model/commands/register-vehicle.command';
import { UpdateVehicleCommand } from '../domain/model/commands/update-vehicle.command';
import { IngestTelemetryCommand } from '../domain/model/commands/ingest-telemetry.command';

// Responses
import { Obd2DeviceResponse } from '../infrastructure/responses/obd2-device.response';
import { Obd2DeviceRegistrationResponse } from '../infrastructure/responses/obd2-registration.response';
import { VehicleResponse } from '../infrastructure/responses/vehicle.response';
import { TelemetrySnapshotResponse } from '../infrastructure/responses/telemetry-snapshot.response';
import { DtcAlertResponse } from '../infrastructure/responses/dtc-alert.response';

@Injectable({ providedIn: 'root' })
export class IotStore {
  // --- Signals ---
  private readonly obd2DevicesSignal = signal<Obd2DeviceResponse[]>([]);
  private readonly availableObd2DevicesSignal = signal<Obd2DeviceResponse[]>([]);
  private readonly activeObd2DeviceSignal = signal<Obd2DeviceResponse | null>(null);

  private readonly registrationsSignal = signal<Obd2DeviceRegistrationResponse[]>([]);
  private readonly activeRegistrationSignal = signal<Obd2DeviceRegistrationResponse | null>(null);

  private readonly vehiclesSignal = signal<VehicleResponse[]>([]);
  private readonly availableVehiclesSignal = signal<VehicleResponse[]>([]);
  private readonly activeVehicleSignal = signal<VehicleResponse | null>(null);

  private readonly telemetrySnapshotsSignal = signal<TelemetrySnapshotResponse[]>([]);
  private readonly latestTelemetrySignal = signal<TelemetrySnapshotResponse | null>(null);
  private readonly dtcAlertsSignal = signal<DtcAlertResponse[]>([]);

  // --- Exposed Readonly Signals ---
  readonly obd2Devices = this.obd2DevicesSignal.asReadonly();
  readonly availableObd2Devices = this.availableObd2DevicesSignal.asReadonly();
  readonly activeObd2Device = this.activeObd2DeviceSignal.asReadonly();

  readonly registrations = this.registrationsSignal.asReadonly();
  readonly activeRegistration = this.activeRegistrationSignal.asReadonly();

  readonly vehicles = this.vehiclesSignal.asReadonly();
  readonly availableVehicles = this.availableVehiclesSignal.asReadonly();
  readonly activeVehicle = this.activeVehicleSignal.asReadonly();

  readonly telemetrySnapshots = this.telemetrySnapshotsSignal.asReadonly();
  readonly latestTelemetry = this.latestTelemetrySignal.asReadonly();
  readonly dtcAlerts = this.dtcAlertsSignal.asReadonly();

  constructor(private api: IotApi, private router: Router) {}

  // ==========================================
  // OBD2 DEVICES
  // ==========================================

  loadObd2Devices(branchId: string) {
    this.api.obd2Devices.getByBranchId(branchId).subscribe({
      next: (devices) => this.obd2DevicesSignal.set(devices),
      error: (err) => console.error('Failed to load OBD2 devices:', err)
    });
  }

  loadAvailableObd2Devices(branchId: string) {
    this.api.obd2Devices.getAvailable(branchId).subscribe({
      next: (devices) => this.availableObd2DevicesSignal.set(devices),
      error: (err) => console.error('Failed to load available OBD2 devices:', err)
    });
  }

  loadObd2DeviceById(id: string) {
    this.api.obd2Devices.getById(id).subscribe({
      next: (device) => this.activeObd2DeviceSignal.set(device),
      error: (err) => console.error('Failed to load OBD2 device:', err)
    });
  }

  createObd2Device(command: CreateObd2DeviceCommand) {
    this.api.obd2Devices.create(command).subscribe({
      next: (device) => {
        const current = this.obd2DevicesSignal();
        this.obd2DevicesSignal.set([...current, device]);
        
        // Also refresh available list since new device is AVAILABLE by default
        const currentAvailable = this.availableObd2DevicesSignal();
        this.availableObd2DevicesSignal.set([...currentAvailable, device]);
      },
      error: (err) => console.error('Failed to create OBD2 device:', err)
    });
  }

  updateObd2Device(id: string, command: UpdateObd2DeviceCommand) {
    this.api.obd2Devices.update(id, command).subscribe({
      next: (updatedDevice) => {
        // Update main devices list
        this.obd2DevicesSignal.update((list) =>
          list.map((d) => (d.id === updatedDevice.id ? updatedDevice : d))
        );
        // Update available list if present
        this.availableObd2DevicesSignal.update((list) =>
          list.map((d) => (d.id === updatedDevice.id ? updatedDevice : d))
        );
        // Update active device if open
        if (this.activeObd2DeviceSignal()?.id === id) {
          this.activeObd2DeviceSignal.set(updatedDevice);
        }
      },
      error: (err) => console.error('Failed to update OBD2 device:', err)
    });
  }

  deleteObd2Device(id: string) {
    this.api.obd2Devices.delete(id).subscribe({
      next: () => {
        this.obd2DevicesSignal.update((list) => list.filter((d) => d.id !== id));
        this.availableObd2DevicesSignal.update((list) => list.filter((d) => d.id !== id));
        if (this.activeObd2DeviceSignal()?.id === id) {
          this.activeObd2DeviceSignal.set(null);
        }
      },
      error: (err) => console.error('Failed to delete OBD2 device:', err)
    });
  }

  // ==========================================
  // OBD2 REGISTRATIONS (COUPLINGS)
  // ==========================================

  loadRegistrations(branchId: string, status: string) {
    this.api.obd2Registrations.getByBranchIdAndStatus(branchId, status).subscribe({
      next: (regs) => this.registrationsSignal.set(regs),
      error: (err) => console.error('Failed to load OBD2 registrations:', err)
    });
  }

  linkObd2Device(command: LinkObd2DeviceCommand) {
    this.api.obd2Registrations.linkObd2Device(command).subscribe({
      next: (reg) => {
        this.registrationsSignal.update((list) => [...list, reg]);
        this.activeRegistrationSignal.set(reg);

        // Remove linked OBD2 and Vehicle from available lists
        this.availableObd2DevicesSignal.update((list) =>
          list.filter((d) => d.id !== command.obd2DeviceId)
        );
        this.availableVehiclesSignal.update((list) =>
          list.filter((v) => v.id !== command.vehicleId)
        );

        // Refresh devices list states
        this.obd2DevicesSignal.update((list) =>
          list.map((d) => d.id === command.obd2DeviceId ? { ...d, status: 'LINKED' } : d)
        );
      },
      error: (err) => console.error('Failed to link OBD2 device to vehicle:', err)
    });
  }

  deactivateRegistration(id: string) {
    this.api.obd2Registrations.deactivate(id).subscribe({
      next: (updatedReg) => {
        this.registrationsSignal.update((list) =>
          list.map((r) => (r.id === updatedReg.id ? updatedReg : r))
        );
        if (this.activeRegistrationSignal()?.id === id) {
          this.activeRegistrationSignal.set(updatedReg);
        }

        // Trigger updates to reload available device/vehicle state lists in UI
        this.loadAvailableObd2Devices(updatedReg.branchId);
        this.loadAvailableVehicles(updatedReg.branchId);
        this.loadObd2Devices(updatedReg.branchId);
      },
      error: (err) => console.error('Failed to deactivate registration:', err)
    });
  }

  loadTelemetrySnapshotsForRegistration(registrationId: string) {
    this.api.obd2Registrations.getTelemetrySnapshots(registrationId).subscribe({
      next: (snapshots) => this.telemetrySnapshotsSignal.set(snapshots),
      error: (err) => console.error('Failed to load registration telemetry snapshots:', err)
    });
  }

  loadDtcAlertsForRegistration(registrationId: string) {
    this.api.obd2Registrations.getDtcAlerts(registrationId).subscribe({
      next: (alerts) => this.dtcAlertsSignal.set(alerts),
      error: (err) => console.error('Failed to load registration DTC alerts:', err)
    });
  }

  // ==========================================
  // VEHICLES
  // ==========================================

  loadAvailableVehicles(branchId: string) {
    this.api.vehicles.getAvailableForLinking(branchId).subscribe({
      next: (vehicles) => this.availableVehiclesSignal.set(vehicles),
      error: (err) => console.error('Failed to load available vehicles:', err)
    });
  }

  loadVehiclesByCustomerId(customerId: string) {
    this.api.vehicles.getByCustomerId(customerId).subscribe({
      next: (vehicles) => this.vehiclesSignal.set(vehicles),
      error: (err) => console.error('Failed to load customer vehicles:', err)
    });
  }

  registerVehicle(command: RegisterVehicleCommand) {
    this.api.vehicles.register(command).subscribe({
      next: (vehicle) => {
        this.vehiclesSignal.update((list) => [...list, vehicle]);
        // Also initially available for linking
        this.availableVehiclesSignal.update((list) => [...list, vehicle]);
      },
      error: (err) => console.error('Failed to register vehicle:', err)
    });
  }

  updateVehicle(id: string, command: UpdateVehicleCommand) {
    this.api.vehicles.update(id, command).subscribe({
      next: (updatedVehicle) => {
        this.vehiclesSignal.update((list) =>
          list.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v))
        );
        this.availableVehiclesSignal.update((list) =>
          list.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v))
        );
        if (this.activeVehicleSignal()?.id === id) {
          this.activeVehicleSignal.set(updatedVehicle);
        }
      },
      error: (err) => console.error('Failed to update vehicle details:', err)
    });
  }

  deleteVehicle(id: string) {
    this.api.vehicles.delete(id).subscribe({
      next: () => {
        this.vehiclesSignal.update((list) => list.filter((v) => v.id !== id));
        this.availableVehiclesSignal.update((list) => list.filter((v) => v.id !== id));
        if (this.activeVehicleSignal()?.id === id) {
          this.activeVehicleSignal.set(null);
        }
      },
      error: (err) => console.error('Failed to delete vehicle:', err)
    });
  }

  loadVehicleTelemetryHistory(vehicleId: string) {
    this.api.vehicles.getTelemetrySnapshotHistory(vehicleId).subscribe({
      next: (snapshots) => this.telemetrySnapshotsSignal.set(snapshots),
      error: (err) => console.error('Failed to load vehicle telemetry history:', err)
    });
  }

  loadVehicleDtcAlertHistory(vehicleId: string) {
    this.api.vehicles.getDtcAlertHistory(vehicleId).subscribe({
      next: (alerts) => this.dtcAlertsSignal.set(alerts),
      error: (err) => console.error('Failed to load vehicle DTC alerts history:', err)
    });
  }

  // ==========================================
  // TELEMETRY BATCHES
  // ==========================================

  ingestTelemetry(command: IngestTelemetryCommand) {
    this.api.telemetry.ingest(command).subscribe({
      next: () => {
        // If ingest was successful, we reload latest telemetry if activeDevice matches
        this.loadLatestTelemetry(command.obd2DeviceId);
      },
      error: (err) => console.error('Failed to ingest telemetry batch:', err)
    });
  }

  loadLatestTelemetry(deviceId: string) {
    this.api.telemetry.getLatest(deviceId).subscribe({
      next: (snapshot) => this.latestTelemetrySignal.set(snapshot),
      error: (err) => console.error('Failed to load latest telemetry snapshot:', err)
    });
  }

  loadTelemetryHistory(deviceId: string) {
    this.api.telemetry.getHistory(deviceId).subscribe({
      next: (snapshots) => this.telemetrySnapshotsSignal.set(snapshots),
      error: (err) => console.error('Failed to load device telemetry history:', err)
    });
  }
}
