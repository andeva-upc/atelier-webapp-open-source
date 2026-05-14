import { BaseEntity } from '../../../shared/domain/model/base-entity';

export interface WorkOrder extends BaseEntity {
  branchId: string;
  internalNumber: number;
  customerId: string;
  billingCustomerId: string | null;
  vehicleId: string;
  assignedMechanicId: string;
  driverName: string;
  driverPhone: string;
  currentMileage: number;
  diagnosis: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderTask {
  id: string;
  workOrderId: string;
  description: string;
  estimatedHours: number;
  unitPrice: number;
  status: 'PENDING' | 'DOING' | 'COMPLETED';
}

/**
 * Model specifically for the list view, joining information from multiple sources.
 */
export interface WorkOrderListItem {
  id: string | number;
  internalNumber: string;
  customerName: string;
  vehicleInfo: string;
  plateNumber: string;
  serviceDescription: string;
  mechanicName: string;
  date: string;
  status: string;
  amount: number;
}
