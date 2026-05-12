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

  /** Simulated total income from screenshot */
  readonly totalIncomeValue = 47100;

  /** Simulated total expenses from screenshot */
  readonly totalExpensesValue = 17500;



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

  /** Simulated monthly financial data matching the user's screenshot */
  readonly monthlyRows = [
    { month: 'Ene', ingresos: 8400,  gastos: 3200 },
    { month: 'Feb', ingresos: 9200,  gastos: 3500 },
    { month: 'Mar', ingresos: 7800,  gastos: 2900 },
    { month: 'Abr', ingresos: 11200, gastos: 4100 },
    { month: 'May', ingresos: 10500, gastos: 3800 },
  ];

  /** Columns to display in the monthly details table */
  readonly detailColumns: string[] = ['month', 'ingresos', 'gastos', 'rentabilidad', 'variacion'];

  /** Computed monthly details with rentabilidad and variacion */
  readonly monthlyDetails = computed(() => {
    let prevRentabilidad: number | null = null;
    return this.monthlyRows.map(row => {
      const rentabilidad = row.ingresos - row.gastos;
      let variacion: number | null = null;
      if (prevRentabilidad !== null && prevRentabilidad !== 0) {
        variacion = ((rentabilidad - prevRentabilidad) / prevRentabilidad) * 100;
      }
      prevRentabilidad = rentabilidad;
      return {
        month: `${row.month} 2026`,
        ingresos: row.ingresos,
        gastos: row.gastos,
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
  readonly yMax = 12000;

  readonly chartGroups = computed(() => {
    const data = this.monthlyRows;
    const groupWidth = this.chartW / data.length;
    // We will render two bars per month side by side
    const barWidth = (groupWidth * 0.4) / 2;
    const gap = 4;

    return data.map((row, i) => {
      const groupCenterX = this.padLeft + (i + 0.5) * groupWidth;
      
      const ingresosH = (row.ingresos / this.yMax) * this.chartH;
      const gastosH = (row.gastos / this.yMax) * this.chartH;

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

  readonly yAxisLabels = [0, 3000, 6000, 8000, 12000].map(val => ({
    val: val === 0 ? 'S/0k' : `S/${val / 1000}k`,
    y: this.padTop + this.chartH - (val / this.yMax) * this.chartH
  }));

  ngOnInit(): void {
    this.store.loadVouchers();
    this.store.loadQuotes();
  }

  /**
   * Maps a Quote status to a human readable label.
   */
  getQuoteStatusLabel(status: string): string {
    const map: Record<string, string> = {
      APPROVED: 'Aprobada',
      DRAFT: 'Pendiente',
      SENT: 'Enviada',
      REJECTED: 'Rechazada',
      EXPIRED: 'Expirada',
    };
    return map[status] ?? status;
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
   * Formats variacion percentage.
   */
  formatVariacion(variacion: number | null): string {
    if (variacion === null) return '---';
    const sign = variacion > 0 ? '+' : '';
    return `${sign}${variacion.toFixed(1)}%`;
  }

  /**
   * Returns CSS class based on variacion value.
   */
  getVariacionClass(variacion: number | null): string {
    if (variacion === null) return 'gray-text';
    return variacion > 0 ? 'text-green' : 'text-red';
  }
}
