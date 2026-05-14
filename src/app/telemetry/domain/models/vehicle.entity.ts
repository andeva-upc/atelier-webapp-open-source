import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Domain model representing a Vehicle.
 */
export class Vehicle implements BaseEntity {
  constructor(
    public readonly id: string,
    public readonly workshopId: string,
    public readonly customerId: string,
    public readonly plateNumber: string,
    public readonly brand: string,
    public readonly model: string,
    public readonly year: number,
    public readonly currentMileage: number,
    public readonly deletedAt?: string | Date
  ) {}

  /**
   * Returns a friendly display name for the vehicle.
   */
  getDisplayName(): string {
    return `${this.brand} ${this.model}`;
  }
}
