import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { IotRepository } from '../domain/repositories/iot.repository';
import { IotSnapshot } from '../domain/models/iot-snapshot.entity';
import { ObdDevice } from '../domain/models/obd-device.entity';
import { DtcAlert } from '../domain/models/dtc-alert.entity';
import { Vehicle } from '../domain/models/vehicle.entity';
import { IotSnapshotEndpoint, ObdDeviceEndpoint, DtcAlertEndpoint, VehicleEndpoint } from './iot-api-endpoint';

/**
 * Concrete implementation of the IotRepository using HTTP endpoints.
 */
@Injectable({ providedIn: 'root' })
export class IotApi extends BaseApi implements IotRepository {
  private readonly snapshotEndpoint = inject(IotSnapshotEndpoint);
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
  getLatestSnapshot(deviceId: string): Observable<IotSnapshot> {
    return this.snapshotEndpoint.find({ device_id: deviceId, _sort: 'timestamp', _order: 'desc', _limit: 1 }).pipe(
      map(snapshots => snapshots[0])
    );
  }

  /**
   * Retrieves iot history for a device within a specific time range.
   */
  getHistory(deviceId: string, from: string | Date, to: string | Date): Observable<IotSnapshot[]> {
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

