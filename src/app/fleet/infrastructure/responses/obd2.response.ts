export interface Obd2DeviceResponse {
  id: string;
  branchId: string;
  macAddress: string;
  status: string;
}

export interface Obd2RegistrationResponse {
  id: string;
  branchId: string;
  obd2DeviceId: string;
  vehicleId: string;
  registeredAt?: string;
  status?: string;
}

export interface TelemetrySnapshotResponse {
  id?: string;
  registrationId?: string;
  timestamp: string;
  speed: number;
  rpm: number;
  engineLoad: number;
  coolantTemp: number;
}

export interface DtcAlertResponse {
  id?: string;
  registrationId?: string;
  timestamp: string;
  troubleCode: string;
  description: string;
  severity: string;
}
