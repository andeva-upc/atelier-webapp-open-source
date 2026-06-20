export interface UpdateAppointmentRequest {
  branchId: string;
  customerId: string;
  vehicleId: string;
  scheduledStart: string;
  notes?: string | null;
}
