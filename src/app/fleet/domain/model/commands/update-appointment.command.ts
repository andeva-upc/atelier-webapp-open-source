export class UpdateAppointmentCommand {
  constructor(
    public branchId: string,
    public customerId: string,
    public vehicleId: string,
    public scheduledStart: string,
    public notes?: string | null
  ) {}
}
