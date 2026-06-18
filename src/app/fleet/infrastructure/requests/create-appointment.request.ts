export interface CreateAppointmentRequest {
  branchId: string;
  customerId: string;
  vehicleId: string;
  scheduledStart: string;
  scheduledEnd: string;
  notes: string;
}
