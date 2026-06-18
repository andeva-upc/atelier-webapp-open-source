export class Appointment {
  id: string;
  branchId: string;
  customerId: string;
  vehicleId: string;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;

  constructor() {
    this.id = '';
    this.branchId = '';
    this.customerId = '';
    this.vehicleId = '';
    this.status = 'PENDING';
    this.scheduledStart = '';
    this.scheduledEnd = '';
    this.notes = '';
    this.createdAt = '';
    this.updatedAt = '';
    this.deletedAt = '';
    this.createdBy = '';
    this.updatedBy = '';
    this.version = 0;
  }
}
