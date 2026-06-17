export interface UpdateAppointmentCommand {
  scheduledStart?: string;
  scheduledEnd?: string;
  notes?: string | null;
  status?: 'PENDING' | 'COMPLETED' | 'CANCELED' | string;
  updatedBy?: string;
}

