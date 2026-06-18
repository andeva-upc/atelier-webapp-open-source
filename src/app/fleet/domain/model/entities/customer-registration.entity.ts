export class CustomerRegistration {
  id: string;
  customerId: string;
  branchId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;

  constructor() {
    this.id = '';
    this.customerId = '';
    this.branchId = '';
    this.status = 'ACTIVE';
    this.createdAt = '';
    this.updatedAt = '';
    this.deletedAt = '';
  }
}
