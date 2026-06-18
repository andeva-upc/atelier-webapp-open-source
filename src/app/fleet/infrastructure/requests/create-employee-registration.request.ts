export interface CreateEmployeeRegistrationRequest {
  employeeId: string;
  branchId: string;
  speciality: string;
  salary: number;
  status?: string;
}
