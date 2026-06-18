export class VehicleRegistration {
  id: string;
  userId: string;
  vehicleId: string;
  status: string;
  createdAt: string;
  deletedAt: string;

  constructor() {
    this.id = '';
    this.userId = '';
    this.vehicleId = '';
    this.status = '';
    this.createdAt = '';
    this.deletedAt = '';
  }
}
