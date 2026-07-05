import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    BaseChartDirective,
    TranslateModule
  ],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  private translate = inject(TranslateService);
  
  // Basic KPIs
  totalWorkOrders = 12;
  activeEmployees = 5;
  monthlyRevenue = 4500;

  displayedColumns: string[] = ['id', 'customer', 'status', 'amount'];
  recentOrders = [
    { id: 'WO-1001', customer: 'Juan Perez', status: 'IN_PROGRESS', amount: 150 },
    { id: 'WO-1002', customer: 'Maria Garcia', status: 'COMPLETED', amount: 320 },
    { id: 'WO-1003', customer: 'Carlos Lopez', status: 'PENDING', amount: 80 }
  ];

  // Bar Chart Configuration (Monthly Revenue/Repairs)
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };
  public barChartOptions: ChartOptions<'bar'> = {};
  public barChartLegend = false;

  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: []
  };
  public doughnutChartOptions: ChartOptions<'doughnut'> = {};

  constructor() {
    this.barChartData = {
      labels: [
        this.translate.instant('admin-dashboard.charts.months.jan'),
        this.translate.instant('admin-dashboard.charts.months.feb'),
        this.translate.instant('admin-dashboard.charts.months.mar'),
        this.translate.instant('admin-dashboard.charts.months.apr'),
        this.translate.instant('admin-dashboard.charts.months.may'),
        this.translate.instant('admin-dashboard.charts.months.jun')
      ],
      datasets: [
        {
          data: [1200, 1900, 3000, 5000, 2000, 4500],
          label: this.translate.instant('admin-dashboard.charts.revenue_label'),
        backgroundColor: '#0071EB',
        borderRadius: 8,
        barThickness: 30
      }
    ]
  };

  this.barChartOptions = {
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
        },
        ticks: {
          callback: (value) => '$' + value
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  this.doughnutChartData = {
    labels: [
      this.translate.instant('admin-dashboard.charts.statuses.pending'),
      this.translate.instant('admin-dashboard.charts.statuses.in_progress'),
      this.translate.instant('admin-dashboard.charts.statuses.completed'),
      this.translate.instant('admin-dashboard.charts.statuses.cancelled')
    ],
    datasets: [
      {
        data: [3, 4, 12, 1],
        backgroundColor: [
          '#F59E0B', // Pendientes (Orange)
          '#3B82F6', // En Progreso (Blue)
          '#10B981', // Completadas (Green)
          '#EF4444'  // Canceladas (Red)
        ]
      }
    ]
  };
  
  this.doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };
  }

  ngOnInit(): void {
    // We will connect CoreStore and OperationsStore in subsequent updates
  }
}
