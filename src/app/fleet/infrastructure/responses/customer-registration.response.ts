export interface CustomerRegistrationResponse {
  id: string;
  customerId: string;
  branchId: string;
  status: 'ACTIVE' | 'INACTIVE' | string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

