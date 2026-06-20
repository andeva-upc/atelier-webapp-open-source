export type AppointmentStatus = 'PENDING' | 'COMPLETED' | 'CANCELED' | string;

export interface AppointmentResource {
  id: string;
  branchId: string;
  customerId: string;
  vehicleId: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: AppointmentStatus;
  notes?: string | null;
}
