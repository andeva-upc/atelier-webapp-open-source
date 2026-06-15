import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { QuoteResource } from '../../../infrastructure/responses/billing-responses';

@Component({
  selector: 'app-quote-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatChipsModule],
  templateUrl: './quote-list.component.html',
  styleUrls: ['./quote-list.component.css']
})
export class QuoteListComponent {
  @Input({ required: true }) quotes: QuoteResource[] = [];
  
  displayedColumns: string[] = ['id', 'customerName', 'description', 'basePrice', 'totalPrice', 'status'];
}
