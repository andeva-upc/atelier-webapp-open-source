import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Domain model representing a point-in-time iot capture from an OBD2 device.
 */
export class IotSnapshot implements BaseEntity {
  constructor(
    public readonly id: string | number,
    public readonly deviceId: string,
    public readonly timestamp: string | Date,
    public readonly rpm: number,
    public readonly speedKmh: number,
    public readonly odometerKm: number,
    public readonly fuelLevelPercent: number,
    public readonly temp: number,
    public readonly workshopId: string = '',
    public readonly deletedAt?: string | Date
  ) {}
}

