export class UpdateWorkOrderDetailsCommand {
  constructor(
    public diagnosticSummary: string,
    public mileageIn: number
  ) {}
}