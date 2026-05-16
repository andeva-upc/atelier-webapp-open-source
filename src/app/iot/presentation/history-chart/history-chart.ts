import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { IotStore } from '../../application/iot.store';

/**
 * Component that renders a historical line chart for iot metrics.
 */
@Component({
  selector: 'app-history-chart',
  standalone: true,
  imports: [CommonModule, TranslateModule, BaseChartDirective],
  templateUrl: './history-chart.html',
  styleUrl: './history-chart.css'
})
export class HistoryChart {
  private readonly store = inject(IotStore);
  private readonly translate = inject(TranslateService);

  public lineChartType: ChartType = 'line';

  /**
   * Data configuration for the line chart, including labels and datasets for RPM and Temperature.
   */
  readonly lineChartData = computed<ChartConfiguration['data']>(() => {
    const history = this.store.history();
    const rpmLabel = this.translate.instant('iot.history.rpm-legend');
    const tempLabel = this.translate.instant('iot.history.temp-legend');
    
    const labels = history.map(h => {
      const date = new Date(h.timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    return {
      datasets: [
        {
          data: history.map(h => h.rpm),
          label: rpmLabel,
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
          label: tempLabel,
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

  /**
   * Options configuration for the chart, including scales, legend, and tooltip settings.
   */
  readonly lineChartOptions = computed<ChartOptions>(() => {
    const rpmTitle = this.translate.instant('iot.metrics.rpm');
    const tempTitle = this.translate.instant('iot.metrics.temp') + ' (°C)';

    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        'y-rpm': {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: rpmTitle,
            font: { family: 'Mona Sans' }
          },
          ticks: { font: { family: 'Mona Sans' } },
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
            text: tempTitle,
            font: { family: 'Mona Sans' }
          },
          ticks: { font: { family: 'Mona Sans' } },
          grid: {
            drawOnChartArea: false
          },
          min: 0,
          max: 120
        },
        x: {
          ticks: { font: { family: 'Mona Sans' } }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            usePointStyle: true,
            boxWidth: 8,
            font: { family: 'Mona Sans' }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          bodyFont: { family: 'Mona Sans' },
          titleFont: { family: 'Mona Sans' }
        }
      }
    };
  });
}

