import { WorkOrderTaskResource } from './work-order-task.response';

export interface WorkOrderResource {
  id: string;
  appointmentId: string;
  branchId: string;
  vehicleId: string;
  customerId: string;
  internalNumber: number;
  status: string;
  diagnosticSummary: string;
  mileageIn: number;
  totalAmount: number;
  tasks: WorkOrderTaskResource[];
}