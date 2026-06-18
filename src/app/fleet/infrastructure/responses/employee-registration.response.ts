export interface EmployeeRegistrationResource {
  id: string;
  employeeId: string;
  branchId: string;
  speciality: string;
  specialityName: string;
  salary: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
}
