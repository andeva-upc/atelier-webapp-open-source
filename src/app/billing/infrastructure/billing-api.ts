import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { VoucherRepository } from '../domain/repositories/voucher.repository';
import { QuoteRepository } from '../domain/repositories/quote.repository';
import { VouchersApiEndpoint } from './vouchers-api-endpoint';
import { QuotesApiEndpoint } from './quotes-api-endpoint';
import { Voucher } from '../domain/models/voucher.entity';
import { Quote } from '../domain/models/quote.entity';

/**
 * Infrastructure facade for the Billing bounded context.
 *
 * @remarks
 * Single public network entry point for the billing domain. Orchestrates access to
 * both {@link VouchersApiEndpoint} and {@link QuotesApiEndpoint}, implementing
 * both domain repository contracts through a single injectable service.
 *
 * Following the Facade pattern, the rest of the application interacts exclusively
 * with this class for all billing-related network operations.
 */
@Injectable({ providedIn: 'root' })
export class BillingApi extends BaseApi implements VoucherRepository, QuoteRepository {
  private readonly vouchersEndpoint = inject(VouchersApiEndpoint);
  private readonly quotesEndpoint = inject(QuotesApiEndpoint);

  // ── VoucherRepository ─────────────────────────────────────────────────────

  /**
   * Retrieves all billing vouchers from the API.
   *
   * @returns An {@link Observable} emitting a collection of {@link Voucher} entities.
   */
  getAll(): Observable<Voucher[]> {
    return this.vouchersEndpoint.getAll();
  }

  /**
   * Retrieves a single voucher by its unique identifier.
   *
   * @param id - The voucher identifier.
   * @returns An {@link Observable} emitting the matched {@link Voucher} entity.
   */
  getById(id: string): Observable<Voucher> {
    return this.vouchersEndpoint.getById(id);
  }

  /**
   * Persists a new voucher in the storage layer.
   *
   * @param voucher - The {@link Voucher} aggregate to create.
   * @returns An {@link Observable} emitting the created {@link Voucher}.
   */
  create(voucher: Voucher): Observable<Voucher> {
    return this.vouchersEndpoint.create(voucher);
  }

  /**
   * Updates the status of an existing voucher.
   *
   * @param id - The voucher unique identifier.
   * @param status - The new status value to apply.
   * @param version - The current optimistic-lock version.
   * @returns An {@link Observable} emitting the updated {@link Voucher}.
   */
  updateStatus(id: string, status: string, version: number): Observable<Voucher> {
    return this.vouchersEndpoint.updateStatus(id, status, version);
  }

  /**
   * Registers a payment for a specific voucher.
   *
   * @param voucherId - The voucher identifier.
   * @param amount - The total amount paid.
   * @param method - The payment method used.
   * @returns An {@link Observable} that completes when the payment is recorded.
   */
  registerPayment(voucherId: string, amount: number, method: string): Observable<void> {
    return this.vouchersEndpoint.registerPayment(voucherId, amount, method);
  }

  // ── QuoteRepository ────────────────────────────────────────────────────────

  /**
   * Retrieves all quotations from the API.
   *
   * @returns An {@link Observable} emitting a collection of {@link Quote} entities.
   */
  getAllQuotes(): Observable<Quote[]> {
    return this.quotesEndpoint.getAll();
  }

  /**
   * Retrieves a single quotation by its unique identifier.
   *
   * @param id - The quotation identifier.
   * @returns An {@link Observable} emitting the matched {@link Quote} entity.
   */
  getQuoteById(id: string): Observable<Quote> {
    return this.quotesEndpoint.getById(id);
  }

  /**
   * Creates a new quotation.
   *
   * @param quote - The {@link Quote} aggregate to persist.
   * @returns An {@link Observable} emitting the created {@link Quote}.
   */
  createQuote(quote: Quote): Observable<Quote> {
    return this.quotesEndpoint.create(quote);
  }

  /**
   * Approves a quotation by updating its status via the underlying endpoint.
   *
   * @param id - The quotation unique identifier.
   * @param version - The current optimistic-lock version.
   * @returns An {@link Observable} emitting the approved {@link Quote}.
   */
  approve(id: string, version: number): Observable<Quote> {
    return this.quotesEndpoint.approve(id, version);
  }
}
