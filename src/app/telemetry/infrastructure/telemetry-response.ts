import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * API Resource for Vehicle.
 */
export interface VehicleResource extends BaseResource {
  id: string;
  customer_id: string;
  plate_number: string;
  brand: string;
  model: string;
  year: number;
  current_mileage: number;
}

/**
 * API Resource for Telemetry Snapshot.
 */
export interface TelemetrySnapshotResource extends BaseResource {
  id: number;
  device_id: string;
  timestamp: string;
  rpm: number;
  speed_kmh: number;
  odometer_km: number;
  fuel_level_percent: number;
  temp: number;
}

/**
 * API Resource for OBD Device.
 */
export interface ObdDeviceResource extends BaseResource {
  id: string;
  mac_address: string;
  vehicle_id: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
}

/**
 * API Resource for DTC Alert.
 */
export interface DtcAlertResource extends BaseResource {
  id: string;
  vehicle_id: string;
  dtc_code: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  is_active: boolean;
}

/**
 * Generic response wrappers.
 */
export interface VehiclesResponse extends BaseResponse {
  vehicles: VehicleResource[];
}

export interface TelemetrySnapshotsResponse extends BaseResponse {
  snapshots: TelemetrySnapshotResource[];
}

export interface ObdDevicesResponse extends BaseResponse {
  devices: ObdDeviceResource[];
}

export interface DtcAlertsResponse extends BaseResponse {
  alerts: DtcAlertResource[];
}
