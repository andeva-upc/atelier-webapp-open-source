import { BaseEntity } from '../../../../shared/domain/model/base-entity';

export class VehicleRegistration extends BaseEntity {
  userId: string;
  vehicleId: string;
  status: string;
  createdAt: string;
  deletedAt: string;

  constructor() {
    super({ id: '' });
    this.userId = '';
    this.vehicleId = '';
    this.status = '';
    this.createdAt = '';
    this.deletedAt = '';
  }
}
