import { BaseEntity } from '../../../shared/domain/model/base-entity';

export enum WorkOrderStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  DIAGNOSING = 'DIAGNOSING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  INVOICED = 'INVOICED'
}

export class WorkOrder implements BaseEntity {
  constructor(
    public readonly id: string,
    public readonly workshopId: string,
    public readonly internalNumber: number,
    public readonly customerId: string,
    public readonly vehicleId: string,
    public readonly assignedMechanicId: string,
    public readonly driverName: string,
    public readonly driverPhone: string,
    public readonly currentMileage: number,
    public readonly diagnosis: string,
    public readonly status: WorkOrderStatus,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    // Joined data
    public readonly customerName?: string,
    public readonly vehicleInfo?: string,
    public readonly plateNumber?: string,
    public readonly mechanicName?: string,
    public readonly serviceName?: string,
    public readonly totalAmount?: number
  ) {}
}
