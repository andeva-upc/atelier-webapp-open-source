import { BaseEntity } from '../../../../shared/domain/model/base-entity';

export class Obd2Device extends BaseEntity {
  branchId: string;
  macAddress: string;
  status: string;

  constructor() {
    super({ id: '' });
    this.branchId = '';
    this.macAddress = '';
    this.status = '';
  }
}
