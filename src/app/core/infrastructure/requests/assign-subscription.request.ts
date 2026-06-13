export interface AssignSubscriptionRequest {
  planId: string;
  billingCycle: string;
  cardNumber: string;
  cardHolderName: string;
  expirationDate: string;
  cvv: string;
}