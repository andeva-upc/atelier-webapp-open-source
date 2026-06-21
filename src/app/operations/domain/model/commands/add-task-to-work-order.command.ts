export class AddTaskToWorkOrderCommand {
  constructor(
    public serviceId: string,
    public assignedMechanicId: string,
    public description: string
  ) {}
}