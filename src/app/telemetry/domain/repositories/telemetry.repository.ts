import { Observable } from 'rxjs';
import { TelemetrySnapshot } from '../models/telemetry-snapshot.entity';
import { ObdDevice } from '../models/obd-device.entity';
import { DtcAlert } from '../models/dtc-alert.entity';

/**
 * Domain Repository Contract for Telemetry operations.
 * 
 * Provides a decoupled interface for accessing telemetry snapshots,
 * device status, and diagnostic alerts.
 */
export abstract class TelemetryRepository {
  /**
   * Retrieves all OBD2 devices registered in the system.
   * 
   * @returns An {@link Observable} emitting a collection of {@link ObdDevice} entities.
   */
  abstract getDevices(): Observable<ObdDevice[]>;

  /**
   * Retrieves the most recent telemetry snapshot for a specific device.
   * 
   * @param deviceId - The unique identifier of the OBD2 device.
   * @returns An {@link Observable} emitting the latest {@link TelemetrySnapshot}.
   */
  abstract getLatestSnapshot(deviceId: string): Observable<TelemetrySnapshot>;

  /**
   * Retrieves a collection of historical snapshots for a device within a time range.
   * 
   * @param deviceId - The unique identifier of the OBD2 device.
   * @param from - Start date/time.
   * @param to - End date/time.
   * @returns An {@link Observable} emitting a collection of {@link TelemetrySnapshot} entities.
   */
  abstract getHistory(deviceId: string, from: string | Date, to: string | Date): Observable<TelemetrySnapshot[]>;

  /**
   * Retrieves all active diagnostic alerts for a specific vehicle.
   * 
   * @param vehicleId - The unique identifier of the vehicle.
   * @returns An {@link Observable} emitting a collection of {@link DtcAlert} entities.
   */
  abstract getActiveAlerts(vehicleId: string): Observable<DtcAlert[]>;
}
