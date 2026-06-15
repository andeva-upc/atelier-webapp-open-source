import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { QuoteResource } from '../../../infrastructure/responses/billing-responses';

@Component({
  selector: 'app-quote-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatTableModule, MatChipsModule, TranslateModule],
  templateUrl: './quote-list.component.html',
  styleUrls: ['./quote-list.component.css']
})
export class QuoteListComponent {
  quotes = input.required<QuoteResource[]>();
  
  displayedColumns: string[] = ['id', 'workOrderId', 'subtotalAmount', 'discountPercentage', 'totalAmount', 'status'];
}
