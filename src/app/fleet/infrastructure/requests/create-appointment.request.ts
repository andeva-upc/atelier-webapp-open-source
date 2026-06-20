export interface CreateAppointmentRequest {
  branchId: string;
  customerId: string;
  vehicleId: string;
  scheduledStart: string;
  notes?: string | null;
}
