import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { ChartModule } from 'primeng/chart';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  matAttachMoney, 
  matAssignment, 
  matDirectionsCar, 
  matWarningAmber,
  matAdd
} from '@ng-icons/material-icons/baseline';
import { DashboardStore } from '../../../application/dashboard.store';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatButtonModule,
    ChartModule,
    TranslateModule,
    NgIcon
  ],
  providers: [
    provideIcons({
      matAttachMoney,
      matAssignment,
      matDirectionsCar,
      matWarningAmber,
      matAdd
    })
  ],
  templateUrl: './home-dashboard.html',
  styleUrl: './home-dashboard.css'
})
export class HomeDashboard implements OnInit {
  private readonly store = inject(DashboardStore);
  private readonly translate = inject(TranslateService);

  // Expose current language as a signal to trigger reactivity in computed properties
  private readonly currentLang = toSignal(this.translate.onLangChange, { initialValue: this.translate.currentLang });

  readonly currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  readonly kpis = this.store.kpis;
  readonly alerts = this.store.alerts;
  readonly recentOrders = this.store.recentOrders;
  readonly isLoading = this.store.loading;

  readonly displayedColumns: string[] = ['workOrderId', 'customerName', 'vehicleName', 'mechanicName', 'status', 'amount'];

  readonly primeChartData = computed(() => {
    // Re-evaluate when language changes
    this.currentLang(); 
    
    const data = this.store.chartData();
    if (!data.length) return null;

    const label = this.translate.instant('dashboard.kpi.income');

    return {
      labels: data.map(d => d.month),
      datasets: [
        {
          label: label,
          data: data.map(d => d.revenue),
          fill: true,
          borderColor: '#FF6F00',
          backgroundColor: 'rgba(255, 111, 0, 0.05)',
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2
        }
      ]
    };
  });

  readonly chartOptions = {
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return 'S/' + (value / 1000) + 'k';
          },
          color: '#9ca3af'
        },
        border: { display: false },
        grid: {
          color: '#f3f4f6',
          drawBorder: false,
        }
      },
      x: {
        ticks: { color: '#9ca3af' },
        grid: { display: false },
        border: { display: false }
      }
    },
    maintainAspectRatio: false
  };

  readonly currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  ngOnInit(): void {
    this.store.loadDashboardData();
  }

  getSeverityDotColor(severity: string): string {
    return severity === 'CRITICAL' ? '#ef4444' : '#f59e0b';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED': 
      case 'DONE': return 'badge-completed';
      case 'IN_PROGRESS': 
      case 'DOING': return 'badge-progress';
      case 'PENDING': return 'badge-pending';
      case 'SCHEDULED': return 'badge-default';
      default: return 'badge-default';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED': 
      case 'DONE': return 'dashboard.status.completed';
      case 'IN_PROGRESS': 
      case 'DOING': return 'dashboard.status.in-progress';
      case 'PENDING': return 'dashboard.status.pending';
      case 'SCHEDULED': return 'dashboard.status.scheduled';
      default: return status;
    }
  }
}
