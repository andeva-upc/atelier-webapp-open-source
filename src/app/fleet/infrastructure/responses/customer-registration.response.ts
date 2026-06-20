export interface CustomerRegistrationResource {
  id: string;
  customerId: string;
  branchId: string;
  status: string;
  createdAt: string;
  deletedAt?: string | null;
}
