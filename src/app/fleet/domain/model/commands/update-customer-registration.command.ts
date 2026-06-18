export class UpdateCustomerRegistrationCommand {
  constructor(
    public status?: 'ACTIVE' | 'INACTIVE' | string,
    public updatedBy?: string
  ) {}
}
