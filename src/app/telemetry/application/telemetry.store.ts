import { Injectable, computed, signal, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { TelemetryRepository } from '../domain/repositories/telemetry.repository';
import { TelemetrySnapshot } from '../domain/models/telemetry-snapshot.entity';
import { ObdDevice } from '../domain/models/obd-device.entity';
import { DtcAlert } from '../domain/models/dtc-alert.entity';
import { Vehicle } from '../domain/models/vehicle.entity';

/**
 * Interface representing the association between a vehicle and its OBD2 device.
 */
export interface VehicleTelemetry {
  vehicle: Vehicle;
  device?: ObdDevice;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'UNLINKED';
}

/**
 * UI-specific model for displaying DTC alerts with associated vehicle data.
 */
export interface DtcAlertUI {
  alert: DtcAlert;
  vehicle?: Vehicle;
  timestamp: Date;
}

/**
 * Reactive store for managing the state of the Telemetry Bounded Context.
 */
@Injectable({
  providedIn: 'root',
})
export class TelemetryStore {
  private readonly repository = inject(TelemetryRepository);

  private readonly vehiclesSignal = signal<Vehicle[]>([]);
  private readonly devicesSignal = signal<ObdDevice[]>([]);
  private readonly selectedDeviceSignal = signal<ObdDevice | null>(null);
  private readonly latestSnapshotSignal = signal<TelemetrySnapshot | null>(null);
  private readonly historySignal = signal<TelemetrySnapshot[]>([]);
  private readonly alertsSignal = signal<DtcAlert[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly vehicles = this.vehiclesSignal.asReadonly();
  readonly devices = this.devicesSignal.asReadonly();
  readonly selectedDevice = this.selectedDeviceSignal.asReadonly();
  readonly latestSnapshot = this.latestSnapshotSignal.asReadonly();
  readonly history = this.historySignal.asReadonly();
  readonly alerts = this.alertsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly activeDevices = computed(() => this.devices().filter(d => d.status === 'ACTIVE'));

  readonly vehicleDevices = computed<VehicleTelemetry[]>(() => {
    const vehicles = this.vehicles();
    const devices = this.devices();

    return vehicles.map(vehicle => {
      const device = devices.find(d => d.vehicleId === vehicle.id);
      return {
        vehicle,
        device,
        status: device ? device.status : 'UNLINKED'
      };
    });
  });

  readonly alertsWithVehicle = computed<DtcAlertUI[]>(() => {
    const alerts = this.alerts();
    const vehicles = this.vehicles();

    return alerts.map(alert => ({
      alert,
      vehicle: vehicles.find(v => v.id === alert.vehicleId),
      timestamp: new Date() // Fallback to current date if missing from backend
    }));
  });

  /**
   * Loads initial data for the dashboard.
   */
  loadInitialData(): void {
    this.loadingSignal.set(true);
    forkJoin({
      vehicles: this.repository.getVehicles(),
      devices: this.repository.getDevices()
    }).subscribe({
      next: (data) => {
        this.vehiclesSignal.set(data.vehicles);
        this.devicesSignal.set(data.devices);
        
        const activeDevices = data.devices.filter(d => d.status === 'ACTIVE');
        if (activeDevices.length > 0 && !this.selectedDevice()) {
          this.selectDevice(activeDevices[0]);
        }
        this.loadingSignal.set(false);
      },
      error: () => {
        this.loadingSignal.set(false);
        this.errorSignal.set('Failed to load initial telemetry data');
      }
    });
  }

  /**
   * Selects a device and loads its data.
   */
  selectDevice(device: ObdDevice): void {
    this.selectedDeviceSignal.set(device);
    this.loadTelemetryData(device);
  }

  /**
   * Links a device to a vehicle.
   */
  linkDevice(deviceId: string, vehicleId: string): void {
    this.loadingSignal.set(true);
    this.repository.linkDevice(deviceId, vehicleId).subscribe({
      next: () => this.loadInitialData(),
      error: () => {
        this.loadingSignal.set(false);
        this.errorSignal.set('Error linking device');
      }
    });
  }

  /**
   * Unlinks a device.
   */
  unlinkDevice(deviceId: string): void {
    this.loadingSignal.set(true);
    this.repository.unlinkDevice(deviceId).subscribe({
      next: () => {
        if (this.selectedDevice()?.id === deviceId) {
          this.selectedDeviceSignal.set(null);
          this.latestSnapshotSignal.set(null);
          this.historySignal.set([]);
          this.alertsSignal.set([]);
        }
        this.loadInitialData();
      },
      error: () => {
        this.loadingSignal.set(false);
        this.errorSignal.set('Error unlinking device');
      }
    });
  }

  private loadTelemetryData(device: ObdDevice): void {
    this.loadingSignal.set(true);
    const to = new Date();
    // Extended to 7 days to ensure mock data (from May 13th) is visible
    const from = new Date(to.getTime() - (7 * 24 * 60 * 60 * 1000)); 

    forkJoin({
      latest: this.repository.getLatestSnapshot(device.id),
      history: this.repository.getHistory(device.id, from.toISOString(), to.toISOString()),
      alerts: this.repository.getActiveAlerts(device.vehicleId)
    }).subscribe({
      next: (data) => {
        this.latestSnapshotSignal.set(data.latest);
        this.historySignal.set(data.history);
        this.alertsSignal.set(data.alerts);
        this.loadingSignal.set(false);
      },
      error: () => {
        this.loadingSignal.set(false);
        this.errorSignal.set(`Failed to load data for device ${device.id}`);
      }
    });
  }

  /**
   * Refreshes the latest snapshot.
   */
  refreshLatestSnapshot(): void {
    const device = this.selectedDevice();
    if (!device) return;

    this.repository.getLatestSnapshot(device.id).subscribe({
      next: (snapshot) => this.latestSnapshotSignal.set(snapshot),
      error: () => console.error('Failed to refresh snapshot')
    });
  }
}
