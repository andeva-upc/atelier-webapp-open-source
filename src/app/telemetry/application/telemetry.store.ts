import { Injectable, computed, signal, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { TelemetryRepository } from '../domain/repositories/telemetry.repository';
import { TelemetrySnapshot } from '../domain/models/telemetry-snapshot.entity';
import { ObdDevice } from '../domain/models/obd-device.entity';
import { DtcAlert } from '../domain/models/dtc-alert.entity';

/**
 * Application service managing telemetry domain state and orchestration.
 */
@Injectable({
  providedIn: 'root',
})
export class TelemetryStore {
  private readonly repository = inject(TelemetryRepository);

  /** Signal containing all registered OBD devices */
  private readonly devicesSignal = signal<ObdDevice[]>([]);

  /** Signal containing the currently selected device */
  private readonly selectedDeviceSignal = signal<ObdDevice | null>(null);

  /** Signal containing the latest telemetry snapshot for the selected device */
  private readonly latestSnapshotSignal = signal<TelemetrySnapshot | null>(null);

  /** Signal containing historical snapshots for the selected device */
  private readonly historySignal = signal<TelemetrySnapshot[]>([]);

  /** Signal containing active DTC alerts for the current vehicle */
  private readonly alertsSignal = signal<DtcAlert[]>([]);

  /** Signal indicating data loading state */
  private readonly loadingSignal = signal<boolean>(false);

  /** Signal for error messages */
  private readonly errorSignal = signal<string | null>(null);

  // Readonly Signals for UI consumption
  readonly devices = this.devicesSignal.asReadonly();
  readonly selectedDevice = this.selectedDeviceSignal.asReadonly();
  readonly latestSnapshot = this.latestSnapshotSignal.asReadonly();
  readonly history = this.historySignal.asReadonly();
  readonly alerts = this.alertsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  /** Computed: Active devices list */
  readonly activeDevices = computed(() => this.devices().filter(d => d.status === 'ACTIVE'));

  /**
   * Initializes the telemetry context by loading all devices.
   */
  loadDevices(): void {
    this.loadingSignal.set(true);
    this.repository.getDevices().subscribe({
      next: (devices) => {
        this.devicesSignal.set(devices);
        if (devices.length > 0 && !this.selectedDevice()) {
          this.selectDevice(devices[0]);
        }
        this.loadingSignal.set(false);
      },
      error: () => {
        this.loadingSignal.set(false);
        this.errorSignal.set('Failed to load telemetry devices');
      }
    });
  }

  /**
   * Selects a device and triggers loading of its specific telemetry data.
   * 
   * @param device - The OBD device to select.
   */
  selectDevice(device: ObdDevice): void {
    this.selectedDeviceSignal.set(device);
    this.loadTelemetryData(device);
  }

  /**
   * Orchestrates the loading of snapshots, history and alerts for a device.
   * 
   * @param device - The device context.
   * @private
   */
  private loadTelemetryData(device: ObdDevice): void {
    this.loadingSignal.set(true);
    
    // Define a standard range for history (e.g., last 24 hours or fixed mockup range)
    const to = new Date();
    const from = new Date(to.getTime() - (24 * 60 * 60 * 1000));

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
   * Refreshes the latest snapshot for real-time monitoring.
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
