import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { VoucherResource } from '../../../infrastructure/responses/billing-responses';

@Component({
  selector: 'app-income-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatChipsModule],
  templateUrl: './income-list.component.html',
  styleUrls: ['./income-list.component.css']
})
export class IncomeListComponent {
  @Input({ required: true }) incomes: VoucherResource[] = [];
  
  displayedColumns: string[] = ['id', 'customerName', 'type', 'totalAmount', 'totalPaid', 'status'];
}
