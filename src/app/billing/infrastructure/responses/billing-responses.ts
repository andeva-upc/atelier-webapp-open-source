export interface QuoteResource {
  id: string;
  workOrderId: string;
  branchId: string;
  subtotalAmount: number;
  discountPercentage: number;
  totalAmount: number;
  status: string;
}

export interface PaymentResource {
  id: string;
  amount: number;
  method: string;
}

export interface VoucherResource {
  id: string;
  quoteId: string;
  type: string;
  customerDocumentType: string;
  customerDocumentNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  externalInvoiceId?: string;
  payments: PaymentResource[];
  totalPaid: number;
}
