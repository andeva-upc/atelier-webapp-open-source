export class CreateCustomerRegistrationCommand {
  constructor(
    public customerId: string,
    public branchId: string,
    public createdBy: string,
    public status?: 'ACTIVE' | 'INACTIVE' | string
  ) {}
}
