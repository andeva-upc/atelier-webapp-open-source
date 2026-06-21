import { BaseEntity } from '../../../../shared/domain/model/base-entity';

export class DtcAlert extends BaseEntity {
  telemetrySnapshotId: string;
  branchId: string;
  dtcCode: string;
  description: string;
  severity: string;
  createdAt: string;

  constructor() {
    super({ id: '' });
    this.telemetrySnapshotId = '';
    this.branchId = '';
    this.dtcCode = '';
    this.description = '';
    this.severity = '';
    this.createdAt = '';
  }
}
