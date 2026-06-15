import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { BillingApi } from '../infrastructure/billing-api';
import { QuoteResource, VoucherResource } from '../infrastructure/responses/billing-responses';
import { FinancialStats } from '../domain/model/financial-stats';
import { CreateQuoteCommand, UpdateQuoteDiscountCommand, ApproveQuoteCommand, CancelQuoteCommand } from '../domain/model/commands/quote-commands';

@Injectable({ providedIn: 'root' })
export class BillingStore {
  // --- Signals ---
  private readonly branchQuotesSignal = signal<QuoteResource[]>([]);
  private readonly branchVouchersSignal = signal<VoucherResource[]>([]);

  // --- Exposed Readonly Signals ---
  readonly branchQuotes = this.branchQuotesSignal.asReadonly();
  readonly branchVouchers = this.branchVouchersSignal.asReadonly();

  // --- Computed Signals ---
  readonly financialStats = computed<FinancialStats>(() => {
    const quotes = this.branchQuotesSignal();
    const vouchers = this.branchVouchersSignal();

    const totalIncome = vouchers.reduce((acc, voucher) => acc + voucher.totalAmount, 0);
    // Temporary mock or static calculation for expenses until an accounting endpoint exists.
    const totalExpenses = 0; 
    
    const approvedQuotesCount = quotes.filter(q => q.status === 'APPROVED').length;
    const pendingQuotesCount = quotes.filter(q => q.status === 'DRAFT').length;

    return {
      totalIncome,
      totalExpenses,
      approvedQuotesCount,
      pendingQuotesCount
    };
  });

  constructor(private api: BillingApi, private router: Router) {}

  // ==========================================
  // LOADERS
  // ==========================================
  loadQuotesByBranchId(branchId: string) {
    this.api.getQuotesByBranchId(branchId).subscribe({
      next: (quotes) => this.branchQuotesSignal.set(quotes),
      error: (err) => console.error('Failed to load branch quotes:', err)
    });
  }

  loadVouchersByBranchId(branchId: string) {
    this.api.getVouchersByBranchId(branchId).subscribe({
      next: (vouchers) => this.branchVouchersSignal.set(vouchers),
      error: (err) => console.error('Failed to load branch vouchers:', err)
    });
  }

  // ==========================================
  // QUOTES MUTATORS
  // ==========================================
  createQuote(command: CreateQuoteCommand) {
    this.api.createQuote(command).subscribe({
      next: (quote) => {
        const currentQuotes = this.branchQuotesSignal();
        this.branchQuotesSignal.set([...currentQuotes, quote]);
      },
      error: (err) => console.error('Failed to create quote:', err)
    });
  }

  updateQuoteDiscount(quoteId: string, command: UpdateQuoteDiscountCommand) {
    this.api.updateQuoteDiscount(command).subscribe({
      next: (quote) => {
        const currentQuotes = this.branchQuotesSignal().map(q => q.id === quote.id ? quote : q);
        this.branchQuotesSignal.set(currentQuotes);
      },
      error: (err) => console.error('Failed to update quote discount:', err)
    });
  }

  approveQuote(quoteId: string) {
    this.api.approveQuote(new ApproveQuoteCommand(quoteId)).subscribe({
      next: (quote) => {
        const currentQuotes = this.branchQuotesSignal().map(q => q.id === quote.id ? quote : q);
        this.branchQuotesSignal.set(currentQuotes);
      },
      error: (err) => console.error('Failed to approve quote:', err)
    });
  }

  cancelQuote(quoteId: string) {
    this.api.cancelQuote(new CancelQuoteCommand(quoteId)).subscribe({
      next: (quote) => {
        const currentQuotes = this.branchQuotesSignal().map(q => q.id === quote.id ? quote : q);
        this.branchQuotesSignal.set(currentQuotes);
      },
      error: (err) => console.error('Failed to cancel quote:', err)
    });
  }
}
