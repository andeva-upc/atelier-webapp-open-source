import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FinancialKpiCardsComponent } from '../../../../billing/presentation/components/financial-kpi-cards/financial-kpi-cards';
import { IncomeExpenseChartComponent } from '../../../../billing/presentation/components/income-expense-chart/income-expense-chart';
import { WorkOrdersListComponent } from '../../../../operations/presentation/views/work-orders-list/work-orders-list';
import { BillingStore } from '../../../../billing/application/billing.store';
import { CoreStore } from '../../../../core/application/core.store';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FinancialKpiCardsComponent,
    IncomeExpenseChartComponent,
    WorkOrdersListComponent
  ],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent {
  public billingStore = inject(BillingStore);
  private coreStore = inject(CoreStore);

  constructor() {
    effect(() => {
      const branch = this.coreStore.currentBranch();
      if (branch?.id) {
        const branchIdStr = branch.id.toString();
        this.billingStore.loadQuotesByBranchId(branchIdStr);
        this.billingStore.loadVouchersByBranchId(branchIdStr);
      }
    }, { allowSignalWrites: true });
  }
}
