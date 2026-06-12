export class CreateWorkOrderCommand {
  constructor(
    public appointmentId: string,
    public branchId: string,
    public vehicleId: string,
    public customerId: string,
    public internalNumber: number,
    public diagnosticSummary: string,
    public mileageIn: number
  ) {}
}