import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Domain model representing a Diagnostic Trouble Code (DTC) alert.
 */
export class DtcAlert implements BaseEntity {
  constructor(
    public readonly id: string,
    public readonly vehicleId: string,
    public readonly dtcCode: string,
    public readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    public readonly description: string,
    public readonly isActive: boolean,
    public readonly workshopId: string = '',
    public readonly deletedAt?: string | Date
  ) {}

  /**
   * Translates internal severity keys to human-readable I18n keys.
   * 
   * @returns The translation key for the severity.
   */
  getSeverityKey(): string {
    return `telemetry.alerts.severity.${this.severity.toLowerCase()}`;
  }

  /**
   * Returns a translation key based on the DTC code.
   * 
   * @returns The translation key for the DTC description.
   */
  getDescriptionKey(): string {
    return `telemetry.dtc.${this.dtcCode}`;
  }
}
