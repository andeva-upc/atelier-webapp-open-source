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
    const branchId = localStorage.getItem('tenantBranchId');
    if (branchId) {
      this.store.loadProductsByBranchId(branchId);
    } else {
      console.warn('No branchId found in localStorage for inventory load');
    }
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
