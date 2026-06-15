import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinancialStats } from '../../../domain/model/financial-stats';

@Component({
  selector: 'app-income-expense-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './income-expense-chart.html',
  styleUrls: ['./income-expense-chart.css']
})
export class IncomeExpenseChartComponent {
  @Input({ required: true }) stats!: FinancialStats;
}
