import { WorkOrderTask } from './work-order-task.entity';

export class WorkOrder {
  id: string;
  appointmentId: string;
  branchId: string;
  vehicleId: string;
  customerId: string;
  internalNumber: number;
  formattedNumber: string;
  status: string; // PENDING, IN_PROGRESS, COMPLETED, PAID
  diagnosticSummary: string;
  mileageIn: number;
  totalAmount: number;
  tasks: WorkOrderTask[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor() {
    this.id = '';
    this.appointmentId = '';
    this.branchId = '';
    this.vehicleId = '';
    this.customerId = '';
    this.internalNumber = 0;
    this.formattedNumber = '';
    this.status = 'PENDING';
    this.diagnosticSummary = '';
    this.mileageIn = 0;
    this.totalAmount = 0;
    this.tasks = [];
  }
}
