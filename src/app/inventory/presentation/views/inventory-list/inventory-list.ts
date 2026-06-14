import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { InventoryStore } from '../../../application/inventory.store';
import { ProductCardComponent } from '../../components/product-card/product-card';
import { ProductResponse } from '../../../infrastructure/responses/product.response';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ProductCardComponent
  ],
  templateUrl: './inventory-list.html',
  styleUrls: ['./inventory-list.css']
})
export class InventoryListComponent implements OnInit {
  private store = inject(InventoryStore);
  private router = inject(Router);

  // Expose the signal from the store
  products = this.store.branchProducts;

  ngOnInit(): void {
    // In a real scenario, this branchId comes from the active session/core store.
    const mockBranchId = '90ce7890-482d-4f27-a006-dc2a3be6be3f';
    this.store.loadProductsByBranchId(mockBranchId);
  }

  onAddProduct(): void {
    this.router.navigate(['/inventory/products/new']);
  }

  onProductClick(product: ProductResponse): void {
    this.router.navigate(['/inventory/products', product.id]);
  }

  onAddBatch(product: ProductResponse): void {
    this.router.navigate(['/inventory/products', product.id, 'batches', 'new']);
  }
}
