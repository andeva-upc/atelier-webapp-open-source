import { BaseEntity } from '../../../../shared/domain/model/base-entity';

export class Obd2DeviceRegistration extends BaseEntity {
  obd2DeviceId: string;
  branchId: string;
  vehicleId: string;
  status: string;
  createdAt: string;

  constructor() {
    super({ id: '' });
    this.obd2DeviceId = '';
    this.branchId = '';
    this.vehicleId = '';
    this.status = '';
    this.createdAt = '';
  }
}
