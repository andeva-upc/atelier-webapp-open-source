import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { TelemetryRepository } from '../domain/repositories/telemetry.repository';
import { TelemetrySnapshot } from '../domain/models/telemetry-snapshot.entity';
import { ObdDevice } from '../domain/models/obd-device.entity';
import { DtcAlert } from '../domain/models/dtc-alert.entity';
import { Vehicle } from '../domain/models/vehicle.entity';
import { TelemetrySnapshotEndpoint, ObdDeviceEndpoint, DtcAlertEndpoint, VehicleEndpoint } from './telemetry-api-endpoint';

/**
 * Concrete implementation of the TelemetryRepository using HTTP endpoints.
 */
@Injectable({ providedIn: 'root' })
export class TelemetryApi extends BaseApi implements TelemetryRepository {
  private readonly snapshotEndpoint = inject(TelemetrySnapshotEndpoint);
  private readonly deviceEndpoint = inject(ObdDeviceEndpoint);
  private readonly alertEndpoint = inject(DtcAlertEndpoint);
  private readonly vehicleEndpoint = inject(VehicleEndpoint);

  /**
   * Retrieves all vehicles.
   */
  getVehicles(): Observable<Vehicle[]> {
    return this.vehicleEndpoint.getAll();
  }

  /**
   * Retrieves all devices.
   */
  getDevices(): Observable<ObdDevice[]> {
    return this.deviceEndpoint.getAll();
  }

  /**
   * Retrieves the latest snapshot for a given device.
   */
  getLatestSnapshot(deviceId: string): Observable<TelemetrySnapshot> {
    return this.snapshotEndpoint.find({ device_id: deviceId, _sort: 'timestamp', _order: 'desc', _limit: 1 }).pipe(
      map(snapshots => snapshots[0])
    );
  }

  /**
   * Retrieves telemetry history for a device within a specific time range.
   */
  getHistory(deviceId: string, from: string | Date, to: string | Date): Observable<TelemetrySnapshot[]> {
    return this.snapshotEndpoint.find({ 
      device_id: deviceId, 
      timestamp_gte: from.toString(), 
      timestamp_lte: to.toString(),
      _sort: 'timestamp',
      _order: 'asc'
    });
  }

  /**
   * Retrieves all active diagnostic alerts for a specific vehicle.
   */
  getActiveAlerts(vehicleId: string): Observable<DtcAlert[]> {
    return this.alertEndpoint.find({ vehicle_id: vehicleId, is_active: true });
  }

  /**
   * Links a device to a specific vehicle.
   */
  linkDevice(deviceId: string, vehicleId: string): Observable<ObdDevice> {
    return this.deviceEndpoint.patch(deviceId, { vehicle_id: vehicleId, status: 'ACTIVE' });
  }

  /**
   * Unlinks a device from its vehicle.
   */
  unlinkDevice(deviceId: string): Observable<ObdDevice> {
    return this.deviceEndpoint.patch(deviceId, { vehicle_id: '', status: 'INACTIVE' });
  }
}
