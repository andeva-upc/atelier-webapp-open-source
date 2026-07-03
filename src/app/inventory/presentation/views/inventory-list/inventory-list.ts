import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InventoryStore } from '../../../application/inventory.store';
import { ProductCardComponent } from '../../components/product-card/product-card';
import { ProductResponse } from '../../../infrastructure/responses/product.response';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ProductCardComponent
  ],
  templateUrl: './inventory-list.html',
  styleUrls: ['./inventory-list.css']
})
export class InventoryListComponent implements OnInit {
  private store = inject(InventoryStore);
  private router = inject(Router);

  // Filters state
  searchQuery = signal<string>('');
  selectedCategory = signal<string>('');
  sortBy = signal<string>('');

  // Computed categories from the store
  categories = computed(() => {
    const products = this.store.branchProducts();
    const cats = products.map(p => p.category).filter(c => !!c);
    return [...new Set(cats)];
  });

  // Filtered and sorted products
  products = computed(() => {
    const allProducts = this.store.branchProducts();
    const query = this.searchQuery().toLowerCase();
    const category = this.selectedCategory();
    const sort = this.sortBy();

    const filtered = allProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query);
      const matchesCategory = category ? p.category === category : true;
      return matchesSearch && matchesCategory;
    });

    if (!sort) return filtered;

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case 'priceAsc':
          return a.salePrice - b.salePrice;
        case 'priceDesc':
          return b.salePrice - a.salePrice;
        case 'stockAsc':
          return a.currentStock - b.currentStock;
        case 'stockDesc':
          return b.currentStock - a.currentStock;
        default:
          return 0;
      }
    });
  });

  ngOnInit(): void {
    const branchId = localStorage.getItem('tenantBranchId') || sessionStorage.getItem('tenantBranchId');
    if (branchId) {
      this.store.loadProductsByBranchId(branchId);
    } else {
      console.warn('No branchId found in localStorage or sessionStorage for inventory load');
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