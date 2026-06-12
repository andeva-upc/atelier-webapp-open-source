export class AddTaskToWorkOrderCommand {
  constructor(
    public serviceId: string,
    public mechanicId: string,
    public description: string,
    public laborPrice: number
  ) {}
}