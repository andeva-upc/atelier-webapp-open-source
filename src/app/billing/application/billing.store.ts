import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BillingApi } from '../infrastructure/billing-api';
import { QuoteResource, VoucherResource } from '../infrastructure/responses/billing-responses';
import { FinancialStats } from '../domain/model/financial-stats';
import { CreateQuoteCommand, UpdateQuoteDiscountCommand, ApproveQuoteCommand, CancelQuoteCommand } from '../domain/model/commands/quote-commands';
import { GenerateVoucherCommand, CheckoutCommand } from '../domain/model/commands/voucher-commands';
import { AddPaymentCommand, RemovePaymentCommand } from '../domain/model/commands/payment-commands';

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

    const totalIncome = vouchers.reduce((acc, voucher) => acc + voucher.totalPaid, 0);
    const pendingBalance = vouchers.reduce((acc, voucher) => acc + (voucher.totalAmount - voucher.totalPaid), 0);
    
    const approvedQuotesCount = quotes.filter(q => q.status === 'APPROVED').length;
    const pendingQuotesCount = quotes.filter(q => q.status === 'DRAFT').length;

    return {
      totalIncome,
      pendingBalance,
      approvedQuotesCount,
      pendingQuotesCount
    };
  });

  constructor(
    private api: BillingApi, 
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

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
        this.snackBar.open('Cotización creada con éxito', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        console.error('Failed to create quote:', err);
        this.snackBar.open('Error al crear la cotización', 'Cerrar', { duration: 3000 });
      }
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
        this.snackBar.open('Cotización aprobada con éxito', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        console.error('Failed to approve quote:', err);
        this.snackBar.open('Error al aprobar la cotización', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cancelQuote(quoteId: string) {
    this.api.cancelQuote(new CancelQuoteCommand(quoteId)).subscribe({
      next: (quote) => {
        const currentQuotes = this.branchQuotesSignal().map(q => q.id === quote.id ? quote : q);
        this.branchQuotesSignal.set(currentQuotes);
        this.snackBar.open('Cotización cancelada con éxito', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        console.error('Failed to cancel quote:', err);
        this.snackBar.open('Error al cancelar la cotización', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // ==========================================
  // VOUCHERS & PAYMENTS MUTATORS
  // ==========================================
  generateVoucher(command: GenerateVoucherCommand) {
    this.api.generateVoucher(command).subscribe({
      next: (voucher) => {
        const currentVouchers = this.branchVouchersSignal();
        this.branchVouchersSignal.set([...currentVouchers, voucher]);
      },
      error: (err) => console.error('Failed to generate voucher:', err)
    });
  }

  checkout(command: CheckoutCommand) {
    this.api.checkout(command).subscribe({
      next: (voucher) => {
        const currentVouchers = this.branchVouchersSignal();
        this.branchVouchersSignal.set([...currentVouchers, voucher]);

        // Actualizar el estado de la cotización a COMPLETED localmente
        const updatedQuotes = this.branchQuotesSignal().map(q => {
          if (q.id === command.quoteId) {
            return { ...q, status: 'COMPLETED' };
          }
          return q;
        });
        this.branchQuotesSignal.set(updatedQuotes);

        this.snackBar.open('Comprobante emitido con éxito', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        console.error('Failed to checkout:', err);
        this.snackBar.open('Error al emitir el comprobante', 'Cerrar', { duration: 3000 });
      }
    });
  }

  addPayment(command: AddPaymentCommand) {
    this.api.addPayment(command).subscribe({
      next: (payment) => {
        const currentVouchers = this.branchVouchersSignal().map(v => {
          if (v.id === command.voucherId) {
            return { ...v, payments: [...v.payments, payment], totalPaid: v.totalPaid + payment.amount };
          }
          return v;
        });
        this.branchVouchersSignal.set(currentVouchers);
      },
      error: (err) => console.error('Failed to add payment:', err)
    });
  }

  removePayment(voucherId: string, paymentId: string) {
    this.api.removePayment(new RemovePaymentCommand(voucherId, paymentId)).subscribe({
      next: () => {
        const currentVouchers = this.branchVouchersSignal().map(v => {
          if (v.id === voucherId) {
            const removedPayment = v.payments.find(p => p.id === paymentId);
            return { 
              ...v, 
              payments: v.payments.filter(p => p.id !== paymentId),
              totalPaid: v.totalPaid - (removedPayment ? removedPayment.amount : 0)
            };
          }
          return v;
        });
        this.branchVouchersSignal.set(currentVouchers);
      },
      error: (err) => console.error('Failed to remove payment:', err)
    });
  }
}
