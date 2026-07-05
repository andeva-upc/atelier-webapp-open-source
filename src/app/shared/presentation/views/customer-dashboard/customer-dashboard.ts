import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

import { IotStore } from '../../../../iot/application/iot.store';
import { FleetStore } from '../../../../fleet/application/fleet.store';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    BaseChartDirective,
    TranslateModule
  ],
  templateUrl: './customer-dashboard.html',
  styleUrls: ['./customer-dashboard.css']
})
export class CustomerDashboardComponent implements OnInit {
  private iotStore = inject(IotStore);
  private fleetStore = inject(FleetStore);
  private translate = inject(TranslateService);

  displayedColumns: string[] = ['plate', 'model', 'status', 'actions'];
  
  // Bind directly to signals from the store
  vehicles = this.iotStore.vehicles;
  appointments = this.fleetStore.appointments;

  // KPIs Computed from signals
  totalVehicles = computed(() => this.vehicles().length);
  nextAppointmentDate = computed(() => {
    const apps = this.appointments();
    if (!apps || apps.length === 0) return null;
    // Find the next upcoming appointment (simplified: just taking the first one if sorted or any pending)
    const pending = apps.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED');
    return pending.length > 0 ? new Date(pending[0].scheduledStart).toLocaleDateString() : null;
  });
  
  // Mocking critical alerts for now as it requires aggregating per vehicle
  criticalAlerts = computed(() => {
    // In a real scenario, we would count DTC alerts for all vehicles.
    return 0; 
  });

  // Chart Configuration
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };
  public lineChartOptions: ChartOptions<'line'> = {};

  constructor() {
    this.lineChartData = {
      labels: [
        this.translate.instant('customer-dashboard.charts.days.mon'),
        this.translate.instant('customer-dashboard.charts.days.tue'),
        this.translate.instant('customer-dashboard.charts.days.wed'),
        this.translate.instant('customer-dashboard.charts.days.thu'),
        this.translate.instant('customer-dashboard.charts.days.fri'),
        this.translate.instant('customer-dashboard.charts.days.sat'),
        this.translate.instant('customer-dashboard.charts.days.sun')
      ],
    datasets: [
      {
        data: [ 65, 59, 80, 81, 56, 55, 40 ],
        label: this.translate.instant('customer-dashboard.charts.usage_label'),
        fill: true,
        tension: 0.5,
        borderColor: '#0071EB',
        backgroundColor: 'rgba(0, 113, 235, 0.2)'
      }
    ]
  };

  this.lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };
}

  public lineChartLegend = false;

  ngOnInit(): void {
    const customerId = localStorage.getItem('customerId');
    if (customerId) {
      this.iotStore.loadVehiclesByCustomerId(customerId);
      this.fleetStore.loadAppointmentsByCustomerId(customerId);
    } else {
      console.warn('Customer ID not found in local storage.');
    }
  }
}
