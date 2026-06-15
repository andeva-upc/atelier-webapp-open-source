import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { VoucherResource } from '../../../infrastructure/responses/billing-responses';

@Component({
  selector: 'app-income-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatTableModule, MatChipsModule, MatButtonModule, TranslateModule],
  templateUrl: './income-list.component.html',
  styleUrls: ['./income-list.component.css']
})
export class IncomeListComponent {
  incomes = input.required<VoucherResource[]>();
  openCheckout = output<void>();
  
  displayedColumns: string[] = ['id', 'customerName', 'type', 'totalAmount', 'totalPaid', 'status'];

  onOpenCheckout() {
    this.openCheckout.emit();
  }
}
