export interface CreateEmployeeRegistrationRequest {
  employeeId: string;
  branchId: string;
  speciality: string;
  specialityName: string;
  salary: number;
  status?: string;
}
