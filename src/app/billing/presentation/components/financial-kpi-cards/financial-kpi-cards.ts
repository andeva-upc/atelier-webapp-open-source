import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FinancialStats } from '../../../domain/model/financial-stats';

@Component({
  selector: 'app-financial-kpi-cards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatCardModule, MatIconModule, TranslateModule],
  templateUrl: './financial-kpi-cards.html',
  styleUrls: ['./financial-kpi-cards.css']
})
export class FinancialKpiCardsComponent {
  stats = input.required<FinancialStats>();
}
