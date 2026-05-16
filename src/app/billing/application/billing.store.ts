import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { retry } from 'rxjs';
import { Voucher } from '../domain/models/voucher.entity';
import { Quote } from '../domain/models/quote.entity';
import { VoucherRepository } from '../domain/repositories/voucher.repository';
import { QuoteRepository } from '../domain/repositories/quote.repository';
import { CustomerRepository } from '../../customers/domain/repositories/customer.repository';
import { Customer } from '../../customers/domain/models/customer.entity';
import { environment } from '../../../environments/environment';

/**
 * Application store centralizing the reactive state for the Billing bounded context.
 *
 * @remarks
 * Orchestrates use cases and administers in-memory state for both
 * {@link Voucher} and {@link Quote} aggregates using Angular Signals.
 * Injected repositories are resolved at runtime by Angular DI to the concrete
 * {@link BillingApi} facade.
 */
@Injectable({ providedIn: 'root' })
export class BillingStore {
  private readonly voucherRepository = inject(VoucherRepository);
  private readonly quoteRepository = inject(QuoteRepository);
  private readonly customerRepository = inject(CustomerRepository);
  private readonly http = inject(HttpClient);


  // ── Voucher signals ────────────────────────────────────────────────────────

  private readonly vouchersSignal = signal<Voucher[]>([]);
  private readonly vouchersLoadingSignal = signal<boolean>(false);
  private readonly vouchersSavingSignal = signal<boolean>(false);
  private readonly vouchersErrorSignal = signal<string | null>(null);

  /** Readonly signal exposing all loaded vouchers. */
  readonly vouchers = this.vouchersSignal.asReadonly();

  /** Readonly signal exposing the voucher data-loading state. */
  readonly vouchersLoading = this.vouchersLoadingSignal.asReadonly();

  /** Readonly signal exposing the voucher save/update operation state. */
  readonly vouchersSaving = this.vouchersSavingSignal.asReadonly();

  /** Readonly signal exposing the latest voucher error message. */
  readonly vouchersError = this.vouchersErrorSignal.asReadonly();

  // ── Customer signals ───────────────────────────────────────────────────────

  private readonly customersSignal = signal<Customer[]>([]);
  readonly customers = this.customersSignal.asReadonly();

  /** Computed total income from all PAID vouchers. */
  readonly totalIncome = computed(() =>
    this.vouchers()
      .filter(v => v.status === 'PAID')
      .reduce((sum, v) => sum + v.totalAmount, 0)
  );

  /** Computed count of PAID vouchers. */
  readonly paidVouchersCount = computed(() =>
    this.vouchers().filter(v => v.status === 'PAID').length
  );

  /** Computed count of PENDING vouchers. */
  readonly pendingVouchersCount = computed(() =>
    this.vouchers().filter(v => v.status === 'PENDING').length
  );

  // ── Quote signals ──────────────────────────────────────────────────────────

  private readonly quotesSignal = signal<Quote[]>([]);
  private readonly quotesLoadingSignal = signal<boolean>(false);
  private readonly quotesErrorSignal = signal<string | null>(null);

  /** Readonly signal exposing all loaded quotations, sorted by date (newest first). */
  readonly quotes = computed(() => {
    return [...this.quotesSignal()].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  /** Readonly signal exposing the quotes data-loading state. */
  readonly quotesLoading = this.quotesLoadingSignal.asReadonly();

  /** Readonly signal exposing the latest quotes error message. */
  readonly quotesError = this.quotesErrorSignal.asReadonly();

  /** Computed count of APPROVED quotes. */
  readonly approvedQuotesCount = computed(() =>
    this.quotes().filter(q => q.status === 'APPROVED').length
  );

  /** Computed count of SENT (pending response) quotes. */
  readonly pendingQuotesCount = computed(() =>
    this.quotes().filter(q => q.status === 'SENT').length
  );

  // ── Product signals (for stock validation in quotes) ───────────────────────

  private readonly productsSignal = signal<any[]>([]);
  readonly products = this.productsSignal.asReadonly();


  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Formats raw errors into human-readable messages.
   *
   * @param error - The error object from the HTTP layer.
   * @param fallback - The fallback message string.
   * @returns A user-readable error string.
   */
  private formatError(error: unknown, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found')
        ? `${fallback}: Not found`
        : error.message;
    }
    return fallback;
  }

  // ── Use Cases: Vouchers ────────────────────────────────────────────────────

  /**
   * Loads all vouchers from the remote API into the reactive state.
   */
  loadVouchers(): void {
    this.vouchersLoadingSignal.set(true);
    this.vouchersErrorSignal.set(null);

    this.voucherRepository.getAll().subscribe({
      next: data => {
        this.vouchersSignal.set(data);
        this.vouchersLoadingSignal.set(false);
      },
      error: err => {
        this.vouchersLoadingSignal.set(false);
        this.vouchersErrorSignal.set(this.formatError(err, 'billing.error.load-vouchers'));
      },
    });
  }

  /**
   * Updates the status of an existing voucher and reflects the change in state.
   *
   * @param id - The voucher unique identifier.
   * @param status - The new status to apply.
   * @param version - The current optimistic-lock version.
   * @param onSuccess - Optional callback executed after a successful update.
   */
  updateVoucherStatus(id: string, status: string, version: number, onSuccess?: () => void): void {
    this.vouchersSavingSignal.set(true);

    this.voucherRepository.updateStatus(id, status, version).pipe(retry(1)).subscribe({
      next: updated => {
        this.vouchersSignal.update(list => list.map(v => (v.id === updated.id ? updated : v)));
        this.vouchersSavingSignal.set(false);
        onSuccess?.();
      },
      error: err => {
        this.vouchersSavingSignal.set(false);
        this.vouchersErrorSignal.set(this.formatError(err, 'billing.error.update-voucher'));
      },
    });
  }

  /**
   * Loads all customers to enable search in quote creation.
   */
  loadCustomers(): void {
    this.customerRepository.getAll().subscribe({
      next: data => this.customersSignal.set(data),
      error: () => console.error('Failed to load customers')
    });
  }

  /**
   * Registers a payment for a voucher and refreshes the voucher list.
   * 
   * @param voucherId - Target voucher ID.
   * @param amount - Amount paid.
   * @param method - Payment method.
   */
  registerPayment(voucherId: string, amount: number, method: string): void {
    this.vouchersSavingSignal.set(true);
    this.voucherRepository.registerPayment(voucherId, amount, method).subscribe({
      next: () => {
        // After payment, reload vouchers to get updated status (PAID)
        this.loadVouchers();
      },
      error: err => {
        this.vouchersSavingSignal.set(false);
        this.vouchersErrorSignal.set(this.formatError(err, 'billing.error.register-payment'));
      }
    });
  }

  // ── Use Cases: Quotes ──────────────────────────────────────────────────────

  /**
   * Loads all quotations from the remote API into the reactive state.
   */
  loadQuotes(): void {
    this.quotesLoadingSignal.set(true);
    this.quotesErrorSignal.set(null);

    this.quoteRepository.getAllQuotes().subscribe({
      next: data => {
        this.quotesSignal.set(data);
        this.quotesLoadingSignal.set(false);
      },
      error: err => {
        this.quotesLoadingSignal.set(false);
        this.quotesErrorSignal.set(this.formatError(err, 'billing.error.load-quotes'));
      },
    });
  }

  /**
   * Approves a quotation and updates the reactive quotes state.
   *
   * @param id - The quotation unique identifier.
   * @param version - The current optimistic-lock version.
   * @param onSuccess - Optional callback executed after successful approval.
   */
  approveQuote(id: string, version: number, onSuccess?: () => void): void {
    this.quoteRepository.approve(id, version).pipe(retry(1)).subscribe({
      next: updated => {
        this.quotesSignal.update(list => list.map(q => (q.id === updated.id ? updated : q)));
        onSuccess?.();
      },
      error: err => {
        this.quotesErrorSignal.set(this.formatError(err, 'billing.error.approve-quote'));
      },
    });
  }

  /**
   * Creates a new quotation and adds it to the reactive state.
   * 
   * @param quote - The quote to create.
   * @param onSuccess - Optional success callback.
   */
  createQuote(quote: Quote, onSuccess?: () => void): void {
    this.quoteRepository.createQuote(quote).subscribe({
      next: created => {
        this.quotesSignal.update(list => [created, ...list]);
        onSuccess?.();
      },
      error: err => {
        this.quotesErrorSignal.set(this.formatError(err, 'billing.error.create-quote'));
      }
    });
  }

  /**
   * Loads available products from the inventory for quote validation.
   */
  loadProducts(): void {
    const url = `${environment.platformProviderApiBaseUrl}${environment.platformProviderProductsEndpointPath}`;
    this.http.get<any[]>(url).subscribe({
      next: data => this.productsSignal.set(data),
      error: () => console.error('Failed to load products')
    });
  }
}

