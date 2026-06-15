import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingStore } from '../../application/billing.store';
import { FinancialKpiCardsComponent } from '../components/financial-kpi-cards/financial-kpi-cards';
import { IncomeExpenseChartComponent } from '../components/income-expense-chart/income-expense-chart';

@Component({
  selector: 'app-billing-dashboard',
  standalone: true,
  imports: [CommonModule, FinancialKpiCardsComponent, IncomeExpenseChartComponent],
  templateUrl: './billing-dashboard.html',
  styleUrls: ['./billing-dashboard.css']
})
export class BillingDashboardComponent implements OnInit {
  store = inject(BillingStore);

  private defaultBranchId = '1'; // In a real scenario, this comes from an Auth or Config store

  ngOnInit() {
    this.store.loadQuotesByBranchId(this.defaultBranchId);
    this.store.loadVouchersByBranchId(this.defaultBranchId);
  }
}
