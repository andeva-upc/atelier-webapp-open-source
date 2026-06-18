export class Obd2Device {
  id: string;
  branchId: string;
  macAddress: string;
  status: string;

  constructor() {
    this.id = '';
    this.branchId = '';
    this.macAddress = '';
    this.status = '';
  }
}
