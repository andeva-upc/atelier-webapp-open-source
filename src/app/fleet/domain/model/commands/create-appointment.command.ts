export class CreateAppointmentCommand {
  constructor(
    public branchId: string,
    public customerId: string,
    public vehicleId: string,
    public scheduledStart: string,
    public scheduledEnd: string,
    public notes: string,
    public createdBy: string
  ) {}
}
