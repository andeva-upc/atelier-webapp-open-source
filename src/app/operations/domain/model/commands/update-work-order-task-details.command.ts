export class UpdateWorkOrderTaskDetailsCommand {
  constructor(
    public serviceId: string,
    public assignedMechanicId: string,
    public description: string
  ) {}
}