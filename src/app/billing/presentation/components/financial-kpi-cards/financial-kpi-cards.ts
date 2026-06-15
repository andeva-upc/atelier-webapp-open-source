import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinancialStats } from '../../../domain/model/financial-stats';

@Component({
  selector: 'app-financial-kpi-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './financial-kpi-cards.html',
  styleUrls: ['./financial-kpi-cards.css']
})
export class FinancialKpiCardsComponent {
  @Input({ required: true }) stats!: FinancialStats;
}
