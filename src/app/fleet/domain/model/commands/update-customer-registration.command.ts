export class UpdateCustomerRegistrationCommand {
  constructor(
    public status: 'ACTIVE' | 'INACTIVE'
  ) {}
}
