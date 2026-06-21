export interface UpdateAppointmentRequest {
  branchId: string;
  customerId: string;
  vehicleId: string;
  scheduledStart: string;
  status: string;
  notes?: string | null;
}
