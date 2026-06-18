export class Obd2DeviceRegistration {
  id: string;
  obd2DeviceId: string;
  branchId: string;
  vehicleId: string;
  status: string;
  createdAt: string;

  constructor() {
    this.id = '';
    this.obd2DeviceId = '';
    this.branchId = '';
    this.vehicleId = '';
    this.status = '';
    this.createdAt = '';
  }
}
