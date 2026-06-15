import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';

import { QuotesApiEndpoint } from './endpoints/quotes-api-endpoint';
import { VouchersApiEndpoint } from './endpoints/vouchers-api-endpoint';
import { PaymentsApiEndpoint } from './endpoints/payments-api-endpoint';

import { CreateQuoteCommand, UpdateQuoteDiscountCommand, ApproveQuoteCommand, CancelQuoteCommand } from '../domain/model/commands/quote-commands';
import { GenerateVoucherCommand, CheckoutCommand } from '../domain/model/commands/voucher-commands';
import { AddPaymentCommand, RemovePaymentCommand } from '../domain/model/commands/payment-commands';

import { QuoteResource, VoucherResource, PaymentResource } from './responses/billing-responses';

@Injectable({providedIn: 'root'})
export class BillingApi extends BaseApi {
  private readonly quotesEndpoint: QuotesApiEndpoint;
  private readonly vouchersEndpoint: VouchersApiEndpoint;
  private readonly paymentsEndpoint: PaymentsApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.quotesEndpoint = new QuotesApiEndpoint(http);
    this.vouchersEndpoint = new VouchersApiEndpoint(http);
    this.paymentsEndpoint = new PaymentsApiEndpoint(http);
  }

  // --- Quotes ---
  createQuote(command: CreateQuoteCommand): Observable<QuoteResource> {
    return this.quotesEndpoint.createQuote(command);
  }

  getQuoteById(id: string): Observable<QuoteResource> {
    return this.quotesEndpoint.getQuoteById(id);
  }

  getQuotesByBranchId(branchId: string): Observable<QuoteResource[]> {
    return this.quotesEndpoint.getQuotesByBranchId(branchId);
  }

  updateQuoteDiscount(command: UpdateQuoteDiscountCommand): Observable<QuoteResource> {
    return this.quotesEndpoint.updateQuoteDiscount(command);
  }

  approveQuote(command: ApproveQuoteCommand): Observable<QuoteResource> {
    return this.quotesEndpoint.approveQuote(command);
  }

  cancelQuote(command: CancelQuoteCommand): Observable<QuoteResource> {
    return this.quotesEndpoint.cancelQuote(command);
  }

  // --- Vouchers ---
  generateVoucher(command: GenerateVoucherCommand): Observable<VoucherResource> {
    return this.vouchersEndpoint.generateVoucher(command);
  }

  getVoucherById(id: string): Observable<VoucherResource> {
    return this.vouchersEndpoint.getVoucherById(id);
  }

  getVouchersByBranchId(branchId: string): Observable<VoucherResource[]> {
    return this.vouchersEndpoint.getVouchersByBranchId(branchId);
  }

  checkout(command: CheckoutCommand): Observable<VoucherResource> {
    return this.vouchersEndpoint.checkout(command);
  }

  // --- Payments ---
  addPayment(command: AddPaymentCommand): Observable<PaymentResource> {
    return this.paymentsEndpoint.addPayment(command);
  }

  removePayment(command: RemovePaymentCommand): Observable<void> {
    return this.paymentsEndpoint.removePayment(command);
  }
}
