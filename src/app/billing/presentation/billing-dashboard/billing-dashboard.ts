import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BillingStore } from '../../application/billing.store';
import { FinancialKpiCardsComponent } from '../components/financial-kpi-cards/financial-kpi-cards';
import { IncomeExpenseChartComponent } from '../components/income-expense-chart/income-expense-chart';
import { IncomeListComponent } from '../components/income-list/income-list.component';
import { ExpenseListComponent } from '../components/expense-list/expense-list.component';
import { QuoteListComponent } from '../components/quote-list/quote-list.component';
import { CheckoutDialogComponent } from '../components/checkout-dialog/checkout-dialog.component';

@Component({
  selector: 'app-billing-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatTabsModule, MatDialogModule, TranslateModule, FinancialKpiCardsComponent, IncomeExpenseChartComponent, IncomeListComponent, ExpenseListComponent, QuoteListComponent],
  templateUrl: './billing-dashboard.html',
  styleUrls: ['./billing-dashboard.css']
})
export class BillingDashboardComponent implements OnInit {
  store = inject(BillingStore);
  dialog = inject(MatDialog);

  private defaultBranchId = '1'; // In a real scenario, this comes from an Auth or Config store

  ngOnInit() {
    this.store.loadQuotesByBranchId(this.defaultBranchId);
    this.store.loadVouchersByBranchId(this.defaultBranchId);
  }

  openCheckoutDialog() {
    const approvedQuotes = this.store.branchQuotes().filter(q => q.status === 'APPROVED');
    
    const dialogRef = this.dialog.open(CheckoutDialogComponent, {
      width: '500px',
      data: { approvedQuotes }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.checkout(result);
      }
    });
  }
}
