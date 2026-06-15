import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { QuoteResource } from '../../../infrastructure/responses/billing-responses';

@Component({
  selector: 'app-quote-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatChipsModule, TranslateModule],
  templateUrl: './quote-list.component.html',
  styleUrls: ['./quote-list.component.css']
})
export class QuoteListComponent {
  @Input({ required: true }) quotes: QuoteResource[] = [];
  
  displayedColumns: string[] = ['id', 'workOrderId', 'subtotalAmount', 'discountPercentage', 'totalAmount', 'status'];
}
