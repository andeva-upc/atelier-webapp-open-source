export interface CreateQuoteRequest {
  workOrderId: string;
  branchId: string;
  discountPercentage: number;
}

export interface UpdateQuoteDiscountRequest {
  discountPercentage: number;
}

export interface GenerateVoucherRequest {
  quoteId: string;
  type: string;
  customerDocumentType: string;
  customerDocumentNumber: string;
  customerName: string;
}

export interface CheckoutRequest {
  quoteId: string;
  type: string;
  customerDocumentType: string;
  customerDocumentNumber: string;
  customerName: string;
  method: string;
}

export interface AddPaymentRequest {
  amount: number;
  method: string;
}
