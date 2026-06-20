export class CreateCustomerRegistrationCommand {
  constructor(
    public customerId: string,
    public branchId: string
  ) {}
}
