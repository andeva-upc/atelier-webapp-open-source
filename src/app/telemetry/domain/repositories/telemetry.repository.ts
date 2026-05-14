import { Observable } from 'rxjs';
import { TelemetrySnapshot } from '../models/telemetry-snapshot.entity';
import { ObdDevice } from '../models/obd-device.entity';
import { DtcAlert } from '../models/dtc-alert.entity';
import { Vehicle } from '../models/vehicle.entity';

/**
 * Domain Repository Contract for Telemetry operations.
 */
export abstract class TelemetryRepository {
  /**
   * Retrieves all vehicles registered in the system.
   */
  abstract getVehicles(): Observable<Vehicle[]>;

  /**
   * Retrieves all OBD2 devices registered in the system.
   */
  abstract getDevices(): Observable<ObdDevice[]>;

  /**
   * Retrieves the most recent telemetry snapshot for a specific device.
   */
  abstract getLatestSnapshot(deviceId: string): Observable<TelemetrySnapshot>;

  /**
   * Retrieves a collection of historical snapshots for a device within a time range.
   */
  abstract getHistory(deviceId: string, from: string | Date, to: string | Date): Observable<TelemetrySnapshot[]>;

  /**
   * Retrieves all active diagnostic alerts for a specific vehicle.
   */
  abstract getActiveAlerts(vehicleId: string): Observable<DtcAlert[]>;
}
