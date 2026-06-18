export interface UpdateAppointmentRequest {
  scheduledStart?: string;
  scheduledEnd?: string;
  notes?: string | null;
  status?: string;
}
