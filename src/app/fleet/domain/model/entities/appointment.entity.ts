export class Appointment {
  id: string;
  branchId: string;
  customerId: string;
  vehicleId: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
  notes: string | null;

  constructor() {
    this.id = '';
    this.branchId = '';
    this.customerId = '';
    this.vehicleId = '';
    this.scheduledStart = '';
    this.scheduledEnd = '';
    this.status = 'PENDING';
    this.notes = null;
  }
}
