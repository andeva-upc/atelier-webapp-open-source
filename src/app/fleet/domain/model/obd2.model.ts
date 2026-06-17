export interface Obd2Device {
  id: string;
  branchId: string;
  macAddress: string;
  status: string; // e.g. 'AVAILABLE', 'LINKED'
}

export interface Obd2Registration {
  id: string;
  branchId: string;
  obd2DeviceId: string;
  vehicleId: string;
  registeredAt?: string;
  status?: string; // e.g. 'ACTIVE', 'INACTIVE'
}

export interface TelemetrySnapshot {
  id?: string;
  registrationId?: string;
  timestamp: string;
  speed: number;
  rpm: number;
  engineLoad: number;
  coolantTemp: number;
}

export interface DtcAlert {
  id?: string;
  registrationId?: string;
  timestamp: string;
  troubleCode: string;
  description: string;
  severity: string;
}
