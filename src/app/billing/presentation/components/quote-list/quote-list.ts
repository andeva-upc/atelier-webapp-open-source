import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { QuoteResource } from '../../../infrastructure/responses/billing-responses';

@Component({
  selector: 'app-quote-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatTableModule, MatChipsModule, MatButtonModule, TranslateModule],
  templateUrl: './quote-list.component.html',
  styleUrls: ['./quote-list.component.css']
})
export class QuoteListComponent {
  quotes = input.required<QuoteResource[]>();
  openCreateQuote = output<void>();
  approveQuote = output<string>();
  cancelQuote = output<string>();
  
  displayedColumns: string[] = ['id', 'workOrderId', 'subtotalAmount', 'discountPercentage', 'totalAmount', 'status', 'actions'];

  onOpenCreateQuote() {
    this.openCreateQuote.emit();
  }

  onApprove(id: string) {
    this.approveQuote.emit(id);
  }

  onCancel(id: string) {
    this.cancelQuote.emit(id);
  }
}
