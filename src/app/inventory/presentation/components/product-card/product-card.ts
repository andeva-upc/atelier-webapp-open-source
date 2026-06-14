import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductResponse } from '../../../../infrastructure/responses/product.response';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.css']
})
export class ProductCardComponent {
  @Input() product!: ProductResponse;
  
  @Output() cardClick = new EventEmitter<ProductResponse>();
  @Output() addBatchClick = new EventEmitter<ProductResponse>();

  onCardClick(): void {
    this.cardClick.emit(this.product);
  }

  onAddBatchClick(event: Event): void {
    event.stopPropagation(); // Prevent triggering card click
    this.addBatchClick.emit(this.product);
  }
}
