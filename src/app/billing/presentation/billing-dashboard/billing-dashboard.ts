import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { BillingStore } from '../../application/billing.store';
import { FinancialKpiCardsComponent } from '../components/financial-kpi-cards/financial-kpi-cards';
import { IncomeExpenseChartComponent } from '../components/income-expense-chart/income-expense-chart';
import { IncomeListComponent } from '../components/income-list/income-list.component';
import { ExpenseListComponent } from '../components/expense-list/expense-list.component';
import { QuoteListComponent } from '../components/quote-list/quote-list.component';

@Component({
  selector: 'app-billing-dashboard',
  standalone: true,
  imports: [CommonModule, MatTabsModule, FinancialKpiCardsComponent, IncomeExpenseChartComponent, IncomeListComponent, ExpenseListComponent, QuoteListComponent],
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
