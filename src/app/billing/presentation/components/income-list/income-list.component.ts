import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { VoucherResource } from '../../../infrastructure/responses/billing-responses';

@Component({
  selector: 'app-income-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatChipsModule, MatButtonModule, TranslateModule],
  templateUrl: './income-list.component.html',
  styleUrls: ['./income-list.component.css']
})
export class IncomeListComponent {
  @Input({ required: true }) incomes: VoucherResource[] = [];
  @Output() openCheckout = new EventEmitter<void>();
  
  displayedColumns: string[] = ['id', 'customerName', 'type', 'totalAmount', 'totalPaid', 'status'];

  onOpenCheckout() {
    this.openCheckout.emit();
  }
}
