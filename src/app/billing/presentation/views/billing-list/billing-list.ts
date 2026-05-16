import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';

import { BillingStore } from '../../../application/billing.store';
import { Voucher } from '../../../domain/models/voucher.entity';
import { Quote } from '../../../domain/models/quote.entity';

/** Shape for monthly financial data rows */
export interface MonthlyFinancialRow {
  month: string;
  ingresos: number;
  gastos: number;
  rentabilidad: number;
  variacion: string;
}

/**
 * Main presentation component for the Billing bounded context.
 *
 * @remarks
 * Renders financial KPI summary cards, a monthly income/expense chart area,
 * a detailed vouchers table and a quotations table in a tabbed layout.
 * All state is consumed reactively via {@link BillingStore} Angular Signals.
 */
@Component({
  selector: 'app-billing-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatBadgeModule,
  ],
  templateUrl: './billing-list.html',
  styleUrl: './billing-list.css',
})
export class BillingList implements OnInit {
  private readonly store = inject(BillingStore);

  /** Simulated monthly financial data matching the user's screenshot */
  readonly monthlyRows: MonthlyFinancialRow[] = [
    { month: 'Ene 2026', ingresos: 8400,  gastos: 3200, rentabilidad: 5200, variacion: '—' },
    { month: 'Feb 2026', ingresos: 9200,  gastos: 3500, rentabilidad: 5700, variacion: '+9.6%' },
    { month: 'Mar 2026', ingresos: 7800,  gastos: 2900, rentabilidad: 4900, variacion: '-14.0%' },
    { month: 'Abr 2026', ingresos: 11200, gastos: 4100, rentabilidad: 7100, variacion: '+44.9%' },
    { month: 'May 2026', ingresos: 10500, gastos: 3800, rentabilidad: 6700, variacion: '-5.6%' },
  ];

  /** Reactive signal from store — full list of vouchers */
  readonly vouchers = this.store.vouchers;

  /** Reactive signal from store — full list of quotes */
  readonly quotes = this.store.quotes;

  /** Loading state for vouchers */
  readonly vouchersLoading = this.store.vouchersLoading;

  /** Loading state for quotes */
  readonly quotesLoading = this.store.quotesLoading;

  /** Saving state for voucher status updates */
  readonly vouchersSaving = this.store.vouchersSaving;

  /** Simulated total income from screenshot */
  readonly totalIncomeValue = 47100;

  /** Simulated total expenses from screenshot */
  readonly totalExpensesValue = 17500;

  /** Computed total income (PAID vouchers) - keeping original logic as well */
  readonly totalIncome = this.store.totalIncome;

  /** Computed total expenses - local logic */
  readonly totalExpenses = computed(() =>
    this.vouchers()
      .filter(v => v.status === 'CANCELLED')
      .reduce((sum, v) => sum + v.totalAmount, 0)
  );

  /** Computed count of approved quotations */
  readonly approvedQuotesCount = this.store.approvedQuotesCount;

  /** Computed count of pending quotations */
  readonly pendingQuotesCount = this.store.pendingQuotesCount;

  /** Columns to display in the vouchers table */
  readonly voucherColumns: string[] = [
    'voucherNumber', 'customerName', 'type', 'status', 'totalAmount', 'issuedAt', 'actions'
  ];

  /** Columns to display in the quotes table */
  readonly quoteColumns: string[] = [
    'quoteNumber', 'customerName', 'status', 'totalAmount', 'validUntil', 'actions'
  ];

  /** Columns for the monthly detail table */
  readonly monthlyDetailColumns: string[] = ['month', 'ingresos', 'gastos', 'rentabilidad', 'variacion'];

  /** Currently selected tab index (0 = Ingresos/Vouchers, 1 = Cotizaciones) */
  readonly selectedTab = signal<number>(0);

  // ── SVG Chart geometry ────────────────────────────────────────────────────

  readonly svgW = 800;
  readonly svgH = 250;
  readonly padLeft = 60;
  readonly padTop = 20;
  readonly padBottom = 40;
  readonly chartW = this.svgW - this.padLeft - 20;
  readonly chartH = this.svgH - this.padTop - this.padBottom;
  readonly yMax = 12000;

  readonly chartGroups = computed(() => {
    const data = this.monthlyRows;
    const groupWidth = this.chartW / data.length;
    const barWidth = (groupWidth * 0.6) / 2;
    const gap = 4;

    return data.map((row, i) => {
      const groupCenterX = this.padLeft + (i + 0.5) * groupWidth;
      
      const ingresosH = (row.ingresos / this.yMax) * this.chartH;
      const gastosH = (row.gastos / this.yMax) * this.chartH;

      return {
        label: row.month.substring(0, 3),
        ingresosX: groupCenterX - barWidth - gap / 2,
        ingresosY: this.padTop + this.chartH - ingresosH,
        ingresosH,
        gastosX: groupCenterX + gap / 2,
        gastosY: this.padTop + this.chartH - gastosH,
        gastosH,
        barWidth,
        labelX: groupCenterX
      };
    });
  });

  readonly yAxisLabels = [0, 3000, 6000, 9000, 12000].map(val => ({
    val: val === 0 ? 'S/0k' : `S/${val / 1000}k`,
    y: this.padTop + this.chartH - (val / this.yMax) * this.chartH
  }));

  ngOnInit(): void {
    this.store.loadVouchers();
    this.store.loadQuotes();
  }

  /**
   * Maps a {@link Voucher} status to a Material chip color class.
   *
   * @param status - The voucher status string.
   * @returns A CSS class token for the status chip.
   */
  getVoucherStatusClass(status: string): string {
    const map: Record<string, string> = {
      PAID: 'chip-paid',
      PENDING: 'chip-pending',
      CANCELLED: 'chip-cancelled',
      OVERDUE: 'chip-overdue',
    };
    return map[status] ?? 'chip-default';
  }

  /**
   * Maps a {@link Quote} status to a Material chip color class.
   *
   * @param status - The quote status string.
   * @returns A CSS class token for the status chip.
   */
  getQuoteStatusClass(status: string): string {
    const map: Record<string, string> = {
      APPROVED: 'chip-paid',
      SENT: 'chip-pending',
      DRAFT: 'chip-default',
      REJECTED: 'chip-cancelled',
      EXPIRED: 'chip-overdue',
    };
    return map[status] ?? 'chip-default';
  }

  /**
   * Triggers a voucher status update to PAID.
   *
   * @param voucher - The target {@link Voucher} entity.
   */
  markAsPaid(voucher: Voucher): void {
    this.store.updateVoucherStatus(voucher.id, 'PAID', voucher.version);
  }

  /**
   * Triggers approval for the given quotation.
   *
   * @param quote - The target {@link Quote} entity.
   */
  approveQuote(quote: Quote): void {
    this.store.approveQuote(quote.id, quote.version);
  }
}

