import { BaseEntity } from '../../../../shared/domain/model/base-entity';

export class TelemetrySnapshot extends BaseEntity {
  obd2DeviceRegistrationId: string;
  branchId: string;
  rpm: number;
  temperature: number;
  speedKmh: number;
  odometerKm: number;
  fuelLevelPercent: number;
  createdAt: string;

  constructor() {
    super({ id: '' });
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
