export class CreateServiceCommand {
  constructor(
    public branchId: string,
    public name: string,
    public price: number
  ) {}
}