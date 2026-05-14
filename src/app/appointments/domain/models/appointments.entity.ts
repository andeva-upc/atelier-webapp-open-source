import { BaseEntity } from '../../../shared/domain/model/base-entity';

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'PENDING_APPROVAL'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

/**
 * Domain model representing a workshop appointment.
 */
export class Appointment implements BaseEntity {
  constructor(
    public readonly id: string,
    public readonly workshopId: string,
    public readonly branchId: string,
    public readonly appointmentDate: string,
    public readonly status: AppointmentStatus,
    public readonly customerName: string,
    public readonly customerPhone: string,
    public readonly vehicleSummary: string,
    public readonly serviceType: string,
    public readonly mechanicName: string,
    public readonly notes: string,
    public readonly version: number,
    public readonly customerId?: string,
    public readonly vehicleId?: string,
    public readonly deletedAt?: string | Date
  ) {}

  getDateLabel(): string {
    return this.appointmentDate.split('T')[0] ?? this.appointmentDate;
  }

  getTimeLabel(): string {
    const timePart = this.appointmentDate.split('T')[1] ?? '';
    return timePart.substring(0, 5) || '--:--';
  }

  isToday(): boolean {
    const today = new Date().toISOString().split('T')[0];
    return this.getDateLabel() === today;
  }

  isConfirmed(): boolean {
    return this.status === 'SCHEDULED' || this.status === 'IN_PROGRESS';
  }
}
