import { WorkOrderTaskProductResource } from './work-order-task-product.response';

export interface WorkOrderTaskResource {
  id: string;
  serviceId: string;
  branchId: string;
  assignedMechanicId: string;
  status: string;
  description: string;
  price: number;
  startedAt?: string;
  completedAt?: string;
  products: WorkOrderTaskProductResource[];
}