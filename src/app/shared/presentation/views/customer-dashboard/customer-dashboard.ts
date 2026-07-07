import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { IotStore } from '../../../../iot/application/iot.store';
import { FleetStore } from '../../../../fleet/application/fleet.store';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatCardModule,
    BaseChartDirective
  ],
  templateUrl: './customer-dashboard.html',
  styleUrls: ['./customer-dashboard.css']
})
export class CustomerDashboardComponent implements OnInit {
  public iotStore = inject(IotStore);
  public fleetStore = inject(FleetStore);
  private translate = inject(TranslateService);

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [65, 59, 80, 81, 56, 55, 40],
        label: '',
        fill: true,
        tension: 0.4,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointBackgroundColor: '#3B82F6',
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#E5E7EB' } },
      x: { grid: { display: false } }
    }
  };

  ngOnInit() {
    this.setupTranslations();
    this.translate.onLangChange.subscribe(() => {
      this.setupTranslations();
    });

    const customerId = localStorage.getItem('customerId');
    if (customerId) {
      this.iotStore.loadVehiclesByCustomerId(customerId);
      this.fleetStore.loadAppointmentsByCustomerId(customerId);
    } else {
      console.warn('Customer ID not found in local storage.');
    }
  }

  private setupTranslations() {
    this.translate.get([
      'customer-dashboard.charts.days.mon',
      'customer-dashboard.charts.days.tue',
      'customer-dashboard.charts.days.wed',
      'customer-dashboard.charts.days.thu',
      'customer-dashboard.charts.days.fri',
      'customer-dashboard.charts.days.sat',
      'customer-dashboard.charts.days.sun',
      'customer-dashboard.charts.usage_label'
    ]).subscribe(translations => {
      this.lineChartData.labels = [
        translations['customer-dashboard.charts.days.mon'],
        translations['customer-dashboard.charts.days.tue'],
        translations['customer-dashboard.charts.days.wed'],
        translations['customer-dashboard.charts.days.thu'],
        translations['customer-dashboard.charts.days.fri'],
        translations['customer-dashboard.charts.days.sat'],
        translations['customer-dashboard.charts.days.sun']
      ];
      this.lineChartData.datasets[0].label = translations['customer-dashboard.charts.usage_label'];
      // Trigger change detection for the chart by creating a new reference
      this.lineChartData = { ...this.lineChartData };
    });
  }

  get activeAlertsCount(): number {
    // Vehículos no tienen un campo 'status' en la interfaz actual,
    // devolveremos 0 como placeholder hasta que se agregue el módulo de telemetría o alertas.
    return 0;
  }

  get nextAppointmentDate(): string {
    const apps = this.fleetStore.appointments();
    if (apps && apps.length > 0) {
       const dateStr = apps[0].scheduledStart;
       if (dateStr) {
         return new Date(dateStr).toLocaleDateString();
       }
    }
    return this.translate.instant('customer-dashboard.kpi.next_appointment.none');
  }
}
