export class UpdateAppointmentCommand {
  constructor(
    public scheduledStart?: string,
    public scheduledEnd?: string,
    public notes?: string | null,
    public status?: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED' | string,
    public updatedBy?: string
  ) {}
}
