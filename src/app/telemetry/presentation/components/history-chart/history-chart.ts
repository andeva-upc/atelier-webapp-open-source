import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { TelemetryStore } from '../../../application/telemetry.store';

@Component({
  selector: 'app-history-chart',
  standalone: true,
  imports: [CommonModule, TranslateModule, BaseChartDirective],
  template: `
    <div class="chart-container">
      <div class="chart-header">
        <h3>{{ 'telemetry.history.title' | translate }}</h3>
      </div>
      
      <div class="canvas-wrapper">
        <canvas baseChart
                [data]="lineChartData()"
                [options]="lineChartOptions"
                [type]="lineChartType">
        </canvas>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      background: white;
      border-radius: 1rem;
      border: 1px solid #e2e8f0;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .chart-header {
      margin-bottom: 1.5rem;
    }
    .chart-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
    }
    .canvas-wrapper {
      display: block;
      height: 300px;
      width: 100%;
    }
  `]
})
export class HistoryChart {
  private readonly store = inject(TelemetryStore);

  public lineChartType: ChartType = 'line';

  /**
   * Reactive chart data computed from the store's history signal.
   */
  readonly lineChartData = computed<ChartConfiguration['data']>(() => {
    const history = this.store.history();
    
    const labels = history.map(h => {
      const date = new Date(h.timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    return {
      datasets: [
        {
          data: history.map(h => h.rpm),
          label: 'RPM',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: '#3b82f6',
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          fill: 'origin',
          tension: 0.4,
          yAxisID: 'y-rpm'
        },
        {
          data: history.map(h => h.temp),
          label: 'Temp (°C)',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          borderColor: '#f97316',
          pointBackgroundColor: '#f97316',
          pointBorderColor: '#fff',
          fill: 'origin',
          tension: 0.4,
          yAxisID: 'y-temp'
        }
      ],
      labels
    };
  });

  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      'y-rpm': {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'RPM'
        },
        grid: {
          drawOnChartArea: true
        }
      },
      'y-temp': {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Temp (°C)'
        },
        grid: {
          drawOnChartArea: false
        },
        min: 0,
        max: 120
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    }
  };
}
