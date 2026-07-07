import { Component, inject, effect, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BillingStore } from '../../../../billing/application/billing.store';
import { CoreStore } from '../../../../core/application/core.store';
import { OperationsStore } from '../../../../operations/application/operations.store';
import { FleetStore } from '../../../../fleet/application/fleet.store';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    BaseChartDirective
  ],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  public billingStore = inject(BillingStore);
  public operationsStore = inject(OperationsStore);
  public fleetStore = inject(FleetStore);
  private coreStore = inject(CoreStore);
  private translate = inject(TranslateService);

  public activeOrdersCount = computed(() => {
    return this.operationsStore.branchWorkOrders().filter(o => o.status === 'PENDING' || o.status === 'IN_PROGRESS').length;
  });

  public staffCount = computed(() => {
    return this.fleetStore.employeeRegistrations().length;
  });

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#F3F4F6' }, ticks: { callback: (value) => '$' + value } },
      x: { grid: { display: false } }
    },
    animation: { duration: 500 }
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: '#0071EB',
      borderRadius: 4,
      barThickness: 30
    }]
  };

  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } }
    },
    cutout: '65%',
    animation: { duration: 500 }
  };

  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Pendientes', 'En Progreso', 'Completadas', 'Canceladas'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: ['#F59E0B', '#3B82F6', '#10B981', '#EF4444'],
      borderWidth: 0
    }]
  };

  constructor() {
    effect(() => {
      const branch = this.coreStore.currentBranch();
      if (branch?.id) {
        const branchIdStr = branch.id.toString();
        this.billingStore.loadQuotesByBranchId(branchIdStr);
        this.billingStore.loadVouchersByBranchId(branchIdStr);
        this.operationsStore.loadWorkOrdersByBranchId(branchIdStr);
        this.fleetStore.loadEmployeeRegistrationsByBranchId(branchIdStr);
      }
    }, { allowSignalWrites: true });

    // Bar chart: real-time totals from billing store
    // Note: VoucherResource has no date field, so we show accumulated income
    // split proportionally across the last 6 months (each voucher counts as 1 month slot)
    effect(() => {
      const vouchers = this.billingStore.branchVouchers();
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const today = new Date();
      const currentMonth = today.getMonth();

      // Build last 6 months labels
      const labels: string[] = [];
      const data: number[] = [];

      for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        labels.push(monthNames[monthIndex]);
        data.push(0);
      }

      // Since vouchers have no date, distribute them by their list position
      // (last 6 batches of vouchers → each month slot).
      // Each voucher's totalPaid is real data from the backend.
      if (vouchers.length > 0) {
        // All income goes into the current month slot (index 5 = most recent)
        // as we have no per-date breakdown from the API
        const totalPaid = vouchers.reduce((acc, v) => acc + v.totalPaid, 0);
        data[5] = totalPaid;
      }

      this.barChartData = {
        labels,
        datasets: [{
          data,
          backgroundColor: '#0071EB',
          borderRadius: 4,
          barThickness: 30
        }]
      };
    });


    effect(() => {
      const orders = this.operationsStore.branchWorkOrders();
      const pending = orders.filter(o => o.status === 'PENDING').length;
      const completed = orders.filter(o => o.status === 'COMPLETED').length;
      const inProgress = orders.filter(o => o.status === 'IN_PROGRESS').length;
      const cancelled = orders.filter(o => o.status === 'CANCELLED').length;
      
      this.doughnutChartData = {
        ...this.doughnutChartData,
        datasets: [{ ...this.doughnutChartData.datasets[0], data: [pending, inProgress, completed, cancelled] }]
      };
    });
  }

  ngOnInit() {
    // Use stream to wait until translations are fully loaded
    this.translate.stream([
      'admin-dashboard.charts.statuses.pending',
      'admin-dashboard.charts.statuses.in_progress',
      'admin-dashboard.charts.statuses.completed',
      'admin-dashboard.charts.statuses.cancelled'
    ]).subscribe(translations => {
      this.doughnutChartData = {
        ...this.doughnutChartData,
        labels: [
          translations['admin-dashboard.charts.statuses.pending'] || 'Pendientes',
          translations['admin-dashboard.charts.statuses.in_progress'] || 'En Progreso',
          translations['admin-dashboard.charts.statuses.completed'] || 'Completadas',
          translations['admin-dashboard.charts.statuses.cancelled'] || 'Canceladas'
        ]
      };
    });
  }
}
