import { CreateQuoteCommand, UpdateQuoteDiscountCommand } from '../../domain/model/commands/quote-commands';
import { GenerateVoucherCommand, CheckoutCommand } from '../../domain/model/commands/voucher-commands';
import { AddPaymentCommand } from '../../domain/model/commands/payment-commands';
import { CreateQuoteRequest, UpdateQuoteDiscountRequest, GenerateVoucherRequest, CheckoutRequest, AddPaymentRequest } from '../requests/billing-requests';
import { QuoteResource, VoucherResource, PaymentResource } from '../responses/billing-responses';
import { Quote } from '../../domain/model/quote';
import { Voucher } from '../../domain/model/voucher';
import { Payment } from '../../domain/model/payment';

export class QuoteAssembler {
  static toCreateQuoteRequestFromCommand(command: CreateQuoteCommand): CreateQuoteRequest {
    return {
      workOrderId: command.workOrderId,
      branchId: command.branchId,
      discountPercentage: command.discountPercentage
    };
  }

  static toUpdateQuoteDiscountRequestFromCommand(command: UpdateQuoteDiscountCommand): UpdateQuoteDiscountRequest {
    return {
      discountPercentage: command.discountPercentage
    };
  }

  static toQuoteFromResource(resource: QuoteResource): Quote {
    return new Quote(
      resource.id,
      resource.workOrderId,
      resource.branchId,
      resource.subtotalAmount,
      resource.discountPercentage,
      resource.totalAmount,
      resource.status
    );
  }
}

export class PaymentAssembler {
  static toAddPaymentRequestFromCommand(command: AddPaymentCommand): AddPaymentRequest {
    return {
      amount: command.amount,
      method: command.method
    };
  }

  static toPaymentFromResource(resource: PaymentResource): Payment {
    return new Payment(
      resource.amount,
      resource.method,
      resource.id
    );
  }
}

export class VoucherAssembler {
  static toGenerateVoucherRequestFromCommand(command: GenerateVoucherCommand): GenerateVoucherRequest {
    return {
      quoteId: command.quoteId,
      type: command.type,
      customerDocumentType: command.customerDocumentType,
      customerDocumentNumber: command.customerDocumentNumber,
      customerName: command.customerName
    };
  }

  static toCheckoutRequestFromCommand(command: CheckoutCommand): CheckoutRequest {
    return {
      quoteId: command.quoteId,
      type: command.type,
      customerDocumentType: command.customerDocumentType,
      customerDocumentNumber: command.customerDocumentNumber,
      customerName: command.customerName,
      method: command.method
    };
  }

  static toVoucherFromResource(resource: VoucherResource): Voucher {
    return new Voucher(
      resource.id,
      resource.quoteId,
      resource.type,
      resource.customerDocumentType,
      resource.customerDocumentNumber,
      resource.customerName,
      resource.totalAmount,
      resource.status,
      resource.payments.map(PaymentAssembler.toPaymentFromResource),
      resource.totalPaid,
      resource.externalInvoiceId
    );
  }
}
