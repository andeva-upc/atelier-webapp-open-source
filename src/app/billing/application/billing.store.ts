import { Injectable, computed, signal, inject } from '@angular/core';
import { retry } from 'rxjs';
import { Voucher } from '../domain/models/voucher.entity';
import { Quote } from '../domain/models/quote.entity';
import { VoucherRepository } from '../domain/repositories/voucher.repository';
import { QuoteRepository } from '../domain/repositories/quote.repository';

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

  /** Readonly signal exposing all loaded quotations. */
  readonly quotes = this.quotesSignal.asReadonly();

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
}
