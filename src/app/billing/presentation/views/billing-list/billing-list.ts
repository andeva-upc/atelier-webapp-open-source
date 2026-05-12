import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule
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
}
