import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Domain model representing an OBD2 iot device hardware.
 */
/**
 * Domain entity representing an OBD2 device.
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

