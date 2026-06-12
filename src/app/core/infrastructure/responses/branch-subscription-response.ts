export interface BranchSubscriptionResource {
  id: string;
  branchId: string;
  planId: string;
  billingCycle: string;
  status: string;
  startDate: string;
  endDate: string;
}