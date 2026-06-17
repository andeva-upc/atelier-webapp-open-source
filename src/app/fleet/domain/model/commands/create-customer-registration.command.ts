export interface CreateCustomerRegistrationCommand {
  customerId: string;
  branchId: string;
  createdBy: string;
  status?: 'ACTIVE' | 'INACTIVE' | string;
}

