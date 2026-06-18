export class TelemetrySnapshot {
  id: string;
  obd2DeviceRegistrationId: string;
  branchId: string;
  rpm: number;
  temperature: number;
  speedKmh: number;
  odometerKm: number;
  fuelLevelPercent: number;
  createdAt: string;

  constructor() {
    this.id = '';
    this.obd2DeviceRegistrationId = '';
    this.branchId = '';
    this.rpm = 0;
    this.temperature = 0;
    this.speedKmh = 0;
    this.odometerKm = 0;
    this.fuelLevelPercent = 0;
    this.createdAt = '';
  }
}
