export interface UpdateCustomerRegistrationCommand {
  status?: 'ACTIVE' | 'INACTIVE' | string;
  updatedBy?: string;
}

