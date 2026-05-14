import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { BillingStore } from '../../../application/billing.store';


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
    MatChipsModule
  ],
  templateUrl: './billing-list.html',
  styleUrl: './billing-list.css',
})
export class BillingList implements OnInit {
  private readonly store = inject(BillingStore);

  /** Computed total income from store */
  readonly totalIncomeValue = this.store.totalIncome;

  /** Computed total expenses (simulated as 40% of income for now since no expense data exists) */
  readonly totalExpensesValue = computed(() => this.totalIncomeValue() * 0.4);



  /** Computed count of approved quotations */
  readonly approvedQuotesCount = this.store.approvedQuotesCount;

  /** Computed count of pending quotations */
  readonly pendingQuotesCount = this.store.pendingQuotesCount;

  /** Reactive signal from store — full list of quotes */
  readonly quotes = this.store.quotes;

  /** Loading state for quotes */
  readonly quotesLoading = this.store.quotesLoading;

  /** Columns to display in the quotes table */
  readonly quoteColumns: string[] = [
    'quoteNumber', 'customerName', 'vehicle', 'items', 'totalAmount', 'status', 'createdAt', 'actions'
  ];

  /** Currently selected tab index (0 = Ingresos y gastos, 1 = Cotizaciones) */
  readonly selectedTab = signal<number>(0);

  /** Computed monthly financial data derived from vouchers */
  readonly monthlyRows = computed(() => {
    const vouchers = this.store.vouchers();
    const months = ['billing.months.jan', 'billing.months.feb', 'billing.months.mar', 'billing.months.apr', 'billing.months.may'];
    
    return months.map((monthKey, index) => {
      // Month index is 0-based, so Jan=0, Feb=1, etc.
      // Filter vouchers for this month (assuming 2026 for now as per user structure)
      const monthVouchers = vouchers.filter(v => {
        const date = new Date(v.issuedAt);
        return date.getMonth() === index && date.getFullYear() === 2026;
      });

      const ingresos = monthVouchers.reduce((sum, v) => sum + v.totalAmount, 0);
      // Simulate expenses as 40% of income for the month
      const gastos = ingresos * 0.4;

      return {
        month: monthKey,
        ingresos,
        gastos,
        rentabilidad: ingresos - gastos,
        // Variation will be calculated in the table if needed, but here we just return the base data
        variacion: '' 
      };
    });
  });

  /** Columns to display in the monthly details table */
  readonly detailColumns: string[] = ['month', 'ingresos', 'gastos', 'rentabilidad', 'variacion'];

  /** Computed monthly details with formatted rentabilidad and variacion */
  readonly monthlyDetails = computed(() => {
    let prevRentabilidad: number | null = null;
    return this.monthlyRows().map(row => {
      const rentabilidad = row.ingresos - row.gastos;
      let variacion = '—';
      if (prevRentabilidad !== null && prevRentabilidad !== 0) {
        const diff = ((rentabilidad - prevRentabilidad) / prevRentabilidad) * 100;
        variacion = `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
      }
      prevRentabilidad = rentabilidad;
      return {
        ...row,
        rentabilidad,
        variacion
      };
    });
  });

  // ── SVG Chart geometry ────────────────────────────────────────────────────

  readonly svgW = 900;
  readonly svgH = 300;
  readonly padLeft = 60;
  readonly padTop = 30;
  readonly padBottom = 60;
  readonly chartW = this.svgW - this.padLeft - 20;
  readonly chartH = this.svgH - this.padTop - this.padBottom;
  /** Computed Y-axis maximum value based on data, with a minimum of 1000 */
  readonly yMax = computed(() => {
    const data = this.monthlyRows();
    const maxVal = data.reduce((max, row) => Math.max(max, row.ingresos, row.gastos), 0);
    return Math.max(maxVal * 1.2, 1000); // Add 20% margin
  });

  readonly chartGroups = computed(() => {
    const data = this.monthlyRows();
    const groupWidth = this.chartW / data.length;
    // We will render two bars per month side by side
    const barWidth = (groupWidth * 0.4) / 2;
    const gap = 4;

    return data.map((row, i) => {
      const groupCenterX = this.padLeft + (i + 0.5) * groupWidth;
      
      const yMax = this.yMax();
      const ingresosH = yMax > 0 ? (row.ingresos / yMax) * this.chartH : 0;
      const gastosH = yMax > 0 ? (row.gastos / yMax) * this.chartH : 0;

      return {
        label: row.month,
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

  readonly yAxisLabels = computed(() => {
    const max = this.yMax();
    return [0, max * 0.25, max * 0.5, max * 0.75, max].map(val => ({
      val: val === 0 ? 'S/0' : `S/${(val / 1000).toFixed(1)}k`,
      y: this.padTop + this.chartH - (max > 0 ? (val / max) * this.chartH : 0)
    }));
  });

  ngOnInit(): void {
    this.store.loadVouchers();
    this.store.loadQuotes();
  }

  /**
   * Maps a Quote status to a human readable label.
   */
  getQuoteStatusLabel(status: string): string {
    return `billing.quote.status.${status.toLowerCase()}`;
  }

  /**
   * Maps a Quote status to a CSS class for the pill.
   */
  getQuoteStatusClass(status: string): string {
    const map: Record<string, string> = {
      APPROVED: 'chip-success',
      DRAFT: 'chip-warning',
      SENT: 'chip-info',
      REJECTED: 'chip-error',
      EXPIRED: 'chip-error',
    };
    return map[status] ?? 'chip-default';
  }

  /**
   * Returns CSS class based on variacion string value.
   */
  getVariacionClass(variacion: string): string {
    if (variacion === '—') return 'gray-text';
    return variacion.startsWith('+') ? 'text-green' : 'text-red';
  }
}
