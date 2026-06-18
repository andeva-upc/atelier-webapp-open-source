export interface EmployeeRegistrationResponse {
  id: string;
  employeeId: string;
  branchId: string;
  speciality: string;
  specialityName: string;
  salary: number;
  status: 'ACTIVE' | 'INACTIVE' | string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
}
