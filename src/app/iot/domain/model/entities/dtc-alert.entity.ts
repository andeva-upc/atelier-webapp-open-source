export class DtcAlert {
  id: string;
  telemetrySnapshotId: string;
  branchId: string;
  dtcCode: string;
  description: string;
  severity: string;
  createdAt: string;

  constructor() {
    this.id = '';
    this.telemetrySnapshotId = '';
    this.branchId = '';
    this.dtcCode = '';
    this.description = '';
    this.severity = '';
    this.createdAt = '';
  }
}
