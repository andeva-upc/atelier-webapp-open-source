export class UpdateWorkOrderTaskDetailsCommand {
  constructor(
    public serviceId: string,
    public mechanicId: string,
    public description: string,
    public newLaborPrice: number
  ) {}
}