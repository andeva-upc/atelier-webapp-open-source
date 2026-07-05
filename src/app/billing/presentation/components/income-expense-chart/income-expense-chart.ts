import { Component, ElementRef, OnDestroy, ChangeDetectionStrategy, input, viewChild, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FinancialStats } from '../../../domain/model/financial-stats';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-income-expense-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslateModule],
  templateUrl: './income-expense-chart.html',
  styleUrls: ['./income-expense-chart.css']
})
export class IncomeExpenseChartComponent implements OnDestroy {
  stats = input.required<FinancialStats>();
  chartCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('chartCanvas');
  translate = inject(TranslateService);
  
  private chart: Chart | null = null;
  private langSub: any;

  constructor() {
    effect(() => {
      const currentStats = this.stats();
      const canvasRef = this.chartCanvas();

      if (canvasRef) {
        if (!this.chart) {
          this.createChart(canvasRef.nativeElement, currentStats);
        } else {
          this.updateChart(currentStats);
        }
      }
    });

    this.langSub = this.translate.onLangChange.subscribe(() => {
      if (this.chart) {
        this.chart.data.labels = [
          this.translate.instant('billing.kpi.income'),
          this.translate.instant('billing.kpi.pending_balance')
        ];
        this.chart.update();
      }
    });
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.langSub) {
      this.langSub.unsubscribe();
    }
  }

  private createChart(canvas: HTMLCanvasElement, stats: FinancialStats) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: this.getChartData(stats),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 500 // reduce animation time to fix bug on load
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
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
      }
    });
  }

  private updateChart(stats: FinancialStats) {
    if (this.chart) {
      this.chart.data = this.getChartData(stats);
      this.chart.update();
    }
  }

  private getChartData(stats: FinancialStats) {
    return {
      labels: [
        this.translate.instant('billing.kpi.income') || 'Income', 
        this.translate.instant('billing.kpi.pending_balance') || 'Pending Balance'
      ],
      datasets: [{
        data: [stats.totalIncome || 0, stats.pendingBalance || 0],
        backgroundColor: [
          '#0071EB', // Primary Blue for Income
          '#FF6D00'  // Accent Orange for Pending Balance
        ],
        borderRadius: 8,
        barThickness: 45
      }]
    };
  }
}
