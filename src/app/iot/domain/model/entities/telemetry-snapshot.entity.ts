export interface TelemetrySnapshot {
  id: string;
  obd2DeviceRegistrationId: string;
  branchId: string;
  rpm: number;
  temperature: number;
  speedKmh: number;
  odometerKm: number;
  fuelLevelPercent: number;
  createdAt: string;
}
