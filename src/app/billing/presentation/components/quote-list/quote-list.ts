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
  
  displayedColumns: string[] = ['id', 'workOrderId', 'subtotalAmount', 'discountPercentage', 'totalAmount', 'status'];

  onOpenCreateQuote() {
    this.openCreateQuote.emit();
  }
}
