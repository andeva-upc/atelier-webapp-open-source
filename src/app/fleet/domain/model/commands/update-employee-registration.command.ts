export class UpdateEmployeeRegistrationCommand {
  constructor(
    public speciality?: string,
    public specialityName?: string,
    public salary?: number,
    public status?: 'ACTIVE' | 'INACTIVE' | string,
    public updatedBy?: string
  ) {}
}
