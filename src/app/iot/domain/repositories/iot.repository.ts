import { Observable } from 'rxjs';
import { IotSnapshot } from '../models/iot-snapshot.entity';
import { ObdDevice } from '../models/obd-device.entity';
import { DtcAlert } from '../models/dtc-alert.entity';
import { Vehicle } from '../models/vehicle.entity';

/**
 * Domain Repository Contract for Iot operations.
 */
export abstract class IotRepository {
  /**
   * Retrieves all vehicles registered in the system.
   */
  abstract getVehicles(): Observable<Vehicle[]>;

  /**
   * Retrieves all OBD2 devices registered in the system.
   */
  abstract getDevices(): Observable<ObdDevice[]>;

  /**
   * Retrieves the most recent iot snapshot for a specific device.
   */
  abstract getLatestSnapshot(deviceId: string): Observable<IotSnapshot>;

  /**
   * Retrieves a collection of historical snapshots for a device within a time range.
   */
  abstract getHistory(deviceId: string, from: string | Date, to: string | Date): Observable<IotSnapshot[]>;

  /**
   * Retrieves all active diagnostic alerts for a specific vehicle.
   */
  abstract getActiveAlerts(vehicleId: string): Observable<DtcAlert[]>;

  /**
   * Links an OBD2 device to a specific vehicle.
   */
  abstract linkDevice(deviceId: string, vehicleId: string): Observable<ObdDevice>;

  /**
   * Unlinks an OBD2 device from its current vehicle.
   */
  abstract unlinkDevice(deviceId: string): Observable<ObdDevice>;
}

