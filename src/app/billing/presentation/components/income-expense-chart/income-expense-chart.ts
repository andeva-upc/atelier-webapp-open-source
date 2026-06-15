import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FinancialStats } from '../../../domain/model/financial-stats';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-income-expense-chart',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './income-expense-chart.html',
  styleUrls: ['./income-expense-chart.css']
})
export class IncomeExpenseChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) stats!: FinancialStats;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chart: Chart | null = null;

  ngAfterViewInit() {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['stats'] && !changes['stats'].isFirstChange()) {
      this.updateChart();
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private createChart() {
    if (!this.chartCanvas) return;
    
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: this.getChartData(),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Income vs Expenses'
          }
        }
      }
    });
  }

  private updateChart() {
    if (this.chart) {
      this.chart.data = this.getChartData();
      this.chart.update();
    }
  }

  private getChartData() {
    return {
      labels: ['Income', 'Expenses'],
      datasets: [{
        data: [this.stats.totalIncome || 0, this.stats.totalExpenses || 0],
        backgroundColor: [
          '#4CAF50',
          '#F44336' 
        ],
        hoverOffset: 4
      }]
    };
  }
}
