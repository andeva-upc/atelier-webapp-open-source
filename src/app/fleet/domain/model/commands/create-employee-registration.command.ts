export class CreateEmployeeRegistrationCommand {
  constructor(
    public employeeId: string,
    public branchId: string,
    public speciality: string,
    public specialityName: string,
    public salary: number,
    public createdBy: string,
    public status?: 'ACTIVE' | 'INACTIVE' | string
  ) {}
}
