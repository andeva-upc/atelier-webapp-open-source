export interface UpdateAppointmentCommand {
  scheduledStart?: string;
  scheduledEnd?: string;
  notes?: string | null;
  status?: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED' | string;
  updatedBy?: string;
}

