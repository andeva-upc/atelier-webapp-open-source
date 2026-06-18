import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { InventoryStore } from '../../../application/inventory.store';

@Component({
  selector: 'app-product-detail-view',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, TranslateModule],
  templateUrl: './product-detail-view.html',
  styleUrls: ['./product-detail-view.css']
})
export class ProductDetailViewComponent implements OnInit {
  private store = inject(InventoryStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  productId: string | null = null;
  
  // Expose signal to template
  activeProduct = this.store.activeProduct;

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.store.loadProductById(this.productId);
    }
  }

  onBack(): void {
    this.router.navigate(['/inventory']);
  }

  onEdit(): void {
    if (this.productId) {
      this.router.navigate(['/inventory/products', this.productId, 'edit']);
    }
  }

  onViewBatches(): void {
    if (this.productId) {
      this.router.navigate(['/inventory/products', this.productId, 'batches']);
    }
  }
}
