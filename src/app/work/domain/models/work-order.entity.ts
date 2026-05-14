import { BaseEntity } from '../../../shared/domain/model/base-entity';

export enum WorkOrderStatus {
  DRAFT = 'DRAFT',
  DIAGNOSING = 'DIAGNOSING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  INVOICED = 'INVOICED'
}

export class WorkOrder implements BaseEntity {
  constructor(
    public readonly id: string,
    public readonly workshopId: string,
    public readonly branchId: string,
    public readonly internalNumber: number,
    public readonly customerId: string,
    public readonly vehicleId: string,
    public readonly assignedMechanicId: string,
    public readonly driverName: string,
    public readonly driverPhone: string,
    public readonly currentMileage: number,
    public readonly licensePlate: string,
    public readonly diagnosis: string,
    public readonly status: WorkOrderStatus,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    // Joined data for presentation
    public readonly customerName?: string,
    public readonly vehicleInfo?: string,
    public readonly vehicleModel?: string,
    public readonly vehiclePlate?: string,
    public readonly mechanicName?: string,
    public readonly totalAmount?: number,
    public readonly mainService?: string
  ) {}
}
