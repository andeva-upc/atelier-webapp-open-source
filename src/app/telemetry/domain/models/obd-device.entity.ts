import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Domain model representing an OBD2 telemetry device hardware.
 */
export class ObdDevice implements BaseEntity {
  constructor(
    public readonly id: string,
    public readonly macAddress: string,
    public readonly vehicleId: string,
    public readonly status: 'ACTIVE' | 'INACTIVE' | 'ERROR',
    public readonly workshopId: string = '',
    public readonly deletedAt?: string | Date
  ) {}
}
