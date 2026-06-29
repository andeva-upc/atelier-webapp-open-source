import { Component, OnInit, inject, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BillingStore } from '../../application/billing.store';
import { OperationsStore } from '../../../operations/application/operations.store';
import { CoreStore } from '../../../core/application/core.store';
import { FinancialKpiCardsComponent } from '../components/financial-kpi-cards/financial-kpi-cards';
import { IncomeExpenseChartComponent } from '../components/income-expense-chart/income-expense-chart';
import { IncomeListComponent } from '../components/income-list/income-list';
import { QuoteListComponent } from '../components/quote-list/quote-list';
import { CheckoutDialogComponent } from '../components/checkout-dialog/checkout-dialog';
import { CreateQuoteDialogComponent } from '../components/create-quote-dialog/create-quote-dialog';
import { CreateQuoteCommand } from '../../domain/model/commands/quote-commands';
import { CheckoutCommand } from '../../domain/model/commands/voucher-commands';

@Component({
  selector: 'app-billing-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatButtonToggleModule,
    MatDialogModule,
    TranslateModule,
    FinancialKpiCardsComponent,
    IncomeExpenseChartComponent,
    IncomeListComponent,
    QuoteListComponent
  ],
  templateUrl: './billing-dashboard.html',
  styleUrls: ['./billing-dashboard.css']
})
export class BillingDashboardComponent implements OnInit {
  store = inject(BillingStore);
  operationsStore = inject(OperationsStore);
  coreStore = inject(CoreStore);
  dialog = inject(MatDialog);

  currentView = signal<'quotes' | 'vouchers'>('quotes');

  constructor() {
    effect(() => {
      const branch = this.coreStore.currentBranch();
      if (branch?.id) {
        const branchIdStr = branch.id.toString();
        this.store.loadQuotesByBranchId(branchIdStr);
        this.store.loadVouchersByBranchId(branchIdStr);
        this.operationsStore.loadWorkOrdersByBranchId(branchIdStr);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    // Cargas reactivas en el constructor mediante effect
  }

  openCreateQuoteDialog() {
    const branch = this.coreStore.currentBranch();
    const branchId = branch?.id ? branch.id.toString() : '1';

    console.log('--- DEBUG CREATE QUOTE ---');
    console.log('Branch ID:', branchId);
    console.log('Local Storage Branch:', localStorage.getItem('tenantBranchId'));
    console.log('All Branch Work Orders:', this.operationsStore.branchWorkOrders());
    console.log('All Branch Quotes:', this.store.branchQuotes());

    const completedWorkOrders = this.operationsStore.branchWorkOrders().filter(o => 
      o.status === 'COMPLETED' && 
      !this.store.branchQuotes().some(q => q.workOrderId === o.id)
    );

    console.log('Filtered Completed Work Orders:', completedWorkOrders);

    const dialogRef = this.dialog.open(CreateQuoteDialogComponent, {
      width: '500px',
      data: { completedWorkOrders }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.createQuote(new CreateQuoteCommand(
          result.workOrderId,
          branchId,
          result.discountPercentage
        ));
      }
    });
  }

  openCheckoutDialog() {
    const approvedQuotes = this.store.branchQuotes().filter(q => 
      q.status === 'APPROVED' && 
      !this.store.branchVouchers().some(v => v.quoteId === q.id)
    );
    
    const dialogRef = this.dialog.open(CheckoutDialogComponent, {
      width: '500px',
      data: { approvedQuotes }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.checkout(new CheckoutCommand(
          result.quoteId,
          result.type,
          result.customerDocumentType || 'DNI',
          result.customerId,
          result.customerName,
          'CASH'
        ));
      }
    });
  }
}
