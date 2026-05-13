import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { TelemetryRepository } from '../domain/repositories/telemetry.repository';
import { TelemetrySnapshot } from '../domain/models/telemetry-snapshot.entity';
import { ObdDevice } from '../domain/models/obd-device.entity';
import { DtcAlert } from '../domain/models/dtc-alert.entity';
import { TelemetrySnapshotEndpoint, ObdDeviceEndpoint, DtcAlertEndpoint } from './telemetry-api-endpoint';

@Injectable({ providedIn: 'root' })
export class TelemetryApi extends BaseApi implements TelemetryRepository {
  private readonly snapshotEndpoint = inject(TelemetrySnapshotEndpoint);
  private readonly deviceEndpoint = inject(ObdDeviceEndpoint);
  private readonly alertEndpoint = inject(DtcAlertEndpoint);

  getDevices(): Observable<ObdDevice[]> {
    return this.deviceEndpoint.getAll();
  }

  getLatestSnapshot(deviceId: string): Observable<TelemetrySnapshot> {
    return this.snapshotEndpoint.find({ device_id: deviceId, _sort: 'timestamp', _order: 'desc', _limit: 1 }).pipe(
      map(snapshots => snapshots[0])
    );
  }

  getHistory(deviceId: string, from: string | Date, to: string | Date): Observable<TelemetrySnapshot[]> {
    return this.snapshotEndpoint.find({ 
      device_id: deviceId, 
      timestamp_gte: from.toString(), 
      timestamp_lte: to.toString(),
      _sort: 'timestamp',
      _order: 'asc'
    });
  }

  getActiveAlerts(vehicleId: string): Observable<DtcAlert[]> {
    return this.alertEndpoint.find({ vehicle_id: vehicleId, is_active: true });
  }
}
