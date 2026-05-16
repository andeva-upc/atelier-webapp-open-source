import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Domain model representing a Workshop Customer (the vehicle owner).
 * 
 * Follows Pure TypeScript implementation decoupled from any UI or infrastructure framework.
 */
export class Customer implements BaseEntity {
  constructor(
    public readonly id: string,
    public readonly workshopId: string,
    public readonly documentNumber: string,
    public readonly documentType: 'DNI' | 'RUC' | 'CE' | 'PASSPORT',
    public readonly fullName: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly servicesCount: number,
    public readonly vehiclesSummary: string,
    public readonly lastVisitDate: string,
    public readonly version: number,
    public readonly deletedAt?: string | Date
  ) {}

  /**
   * Returns the uppercase initial character of the customer's full name.
   * Commonly used to display placeholder initials in UI avatars.
   * 
   * @returns The first character of the full name in uppercase, or '?' if invalid.
   */
  getAvatarInitial(): string {
    if (!this.fullName || this.fullName.trim().length === 0) {
      return '?';
    }
    return this.fullName.trim().charAt(0).toUpperCase();
  }

  /**
   * Returns an array of vehicles from the summary string to be rendered as UI chips.
   * 
   * @returns Array of vehicle strings.
   */
  getVehiclesList(): string[] {
    if (!this.vehiclesSummary || this.vehiclesSummary === 'Sin vehículos registrados') {
      return [];
    }
    return this.vehiclesSummary.split(', ').filter(v => v.trim() !== '');
  }
}

