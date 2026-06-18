export class EmployeeRegistration {
  id: string;
  employeeId: string;
  branchId: string;
  speciality: string;
  specialityName: string;
  salary: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;

  constructor() {
    this.id = '';
    this.employeeId = '';
    this.branchId = '';
    this.speciality = '';
    this.specialityName = '';
    this.salary = 0;
    this.status = 'ACTIVE';
    this.createdAt = '';
    this.updatedAt = '';
    this.deletedAt = '';
  }
}
