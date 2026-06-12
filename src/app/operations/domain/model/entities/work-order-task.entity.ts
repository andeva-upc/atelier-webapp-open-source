import { WorkOrderTaskProduct } from './work-order-task-product.entity';

export class WorkOrderTask {
  id: string;
  serviceId: string;
  branchId: string;
  assignedMechanicId: string;
  status: string; // PENDING, DOING, COMPLETED
  description: string;
  price: number;
  startedAt?: Date;
  completedAt?: Date;
  products: WorkOrderTaskProduct[];

  constructor() {
    this.id = '';
    this.serviceId = '';
    this.branchId = '';
    this.assignedMechanicId = '';
    this.status = 'PENDING';
    this.description = '';
    this.price = 0;
    this.products = [];
  }
}
