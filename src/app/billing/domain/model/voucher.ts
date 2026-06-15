import { Payment } from './payment';

export class Voucher {
  id: string;
  quoteId: string;
  type: string;
  customerDocumentType: string;
  customerDocumentNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  externalInvoiceId?: string;
  payments: Payment[];
  totalPaid: number;

  constructor(
    id: string,
    quoteId: string,
    type: string,
    customerDocumentType: string,
    customerDocumentNumber: string,
    customerName: string,
    totalAmount: number,
    status: string,
    payments: Payment[],
    totalPaid: number,
    externalInvoiceId?: string
  ) {
    this.id = id;
    this.quoteId = quoteId;
    this.type = type;
    this.customerDocumentType = customerDocumentType;
    this.customerDocumentNumber = customerDocumentNumber;
    this.customerName = customerName;
    this.totalAmount = totalAmount;
    this.status = status;
    this.payments = payments;
    this.totalPaid = totalPaid;
    this.externalInvoiceId = externalInvoiceId;
  }
}
