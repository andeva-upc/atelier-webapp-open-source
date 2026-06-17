export interface CreateAppointmentCommand {
  branchId: string;
  customerId: string;
  vehicleId: string;
  scheduledStart: string;
  scheduledEnd: string;
  notes?: string;
  createdBy: string;
}

