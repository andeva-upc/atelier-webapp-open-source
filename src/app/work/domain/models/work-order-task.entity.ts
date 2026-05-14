import { BaseEntity } from '../../../shared/domain/model/base-entity';

export enum WorkOrderTaskStatus {
  PENDING = 'PENDING',
  DOING = 'DOING',
  DONE = 'DONE'
}

export class WorkOrderTask implements BaseEntity {
  constructor(
    public readonly id: string,
    public readonly workshopId: string,
    public readonly workOrderId: string,
    public readonly description: string,
    public readonly estimatedHours: number,
    public readonly unitPrice: number,
    public readonly status: WorkOrderTaskStatus
  ) {}

  get totalPrice(): number {
    return this.unitPrice; // Simplified: usually would be hours * price or just price
  }
}
