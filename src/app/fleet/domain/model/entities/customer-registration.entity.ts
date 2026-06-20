export class CustomerRegistration {
  id: string;
  customerId: string;
  branchId: string;
  status: string;
  createdAt: string;
  deletedAt: string | null;

  constructor() {
    this.id = '';
    this.customerId = '';
    this.branchId = '';
    this.status = 'ACTIVE';
    this.createdAt = '';
    this.deletedAt = null;
  }
}
