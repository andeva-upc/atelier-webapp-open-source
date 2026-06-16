import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { InventoryApi } from '../infrastructure/inventory-api';
import { Observable, tap } from 'rxjs';
import { ProductResponse } from '../infrastructure/responses/product.response';

import { CreateProductCommand } from '../domain/model/commands/create-product.command';
import { UpdateProductCommand } from '../domain/model/commands/update-product.command';
import { AddBatchToProductCommand } from '../domain/model/commands/add-batch-to-product.command';

@Injectable({ providedIn: 'root' })
export class InventoryStore {
  // --- Signals ---
  private readonly branchProductsSignal = signal<ProductResponse[]>([]);
  private readonly activeProductSignal = signal<ProductResponse | null>(null);

  // --- Exposed Readonly Signals ---
  readonly branchProducts = this.branchProductsSignal.asReadonly();
  readonly activeProduct = this.activeProductSignal.asReadonly();

  constructor(private api: InventoryApi, private router: Router) {}

  // ==========================================
  // PRODUCTS
  // ==========================================

  loadProductsByBranchId(branchId: string) {
    this.api.products.getByBranchId(branchId).subscribe({
      next: (products) => this.branchProductsSignal.set(products),
      error: (err) => console.error('Failed to load branch products:', err)
    });
  }

  loadProductById(productId: string) {
    this.api.products.getById(productId).subscribe({
      next: (product) => this.activeProductSignal.set(product),
      error: (err) => console.error('Failed to load active product:', err)
    });
  }

  createProduct(command: CreateProductCommand): Observable<ProductResponse> {
    return this.api.products.create(command).pipe(
      tap({
        next: (product) => {
          const currentProducts = this.branchProductsSignal();
          this.branchProductsSignal.set([...currentProducts, product]);
          this.activeProductSignal.set(product);
        },
        error: (err) => console.error('Failed to create product:', err)
      })
    );
  }

  updateProduct(productId: string, command: UpdateProductCommand): Observable<ProductResponse> {
    return this.api.products.update(productId, command).pipe(
      tap({
        next: (product) => {
          const currentProducts = this.branchProductsSignal().map(p => p.id === product.id ? product : p);
          this.branchProductsSignal.set(currentProducts);
          if (this.activeProductSignal()?.id === productId) {
              this.activeProductSignal.set(product);
          }
        },
        error: (err) => console.error('Failed to update product:', err)
      })
    );
  }

  deleteProduct(productId: string) {
    this.api.products.delete(productId).subscribe({
      next: () => {
        const currentProducts = this.branchProductsSignal().filter(p => p.id !== productId);
        this.branchProductsSignal.set(currentProducts);
        if (this.activeProductSignal()?.id === productId) {
          this.activeProductSignal.set(null);
        }
      },
      error: (err) => console.error('Failed to delete product:', err)
    });
  }

  // ==========================================
  // BATCHES
  // ==========================================

  addBatchToProduct(productId: string, command: AddBatchToProductCommand) {
    this.api.products.addBatch(productId, command).subscribe({
      next: (product) => {
        const currentProducts = this.branchProductsSignal().map(p => p.id === product.id ? product : p);
        this.branchProductsSignal.set(currentProducts);
        if (this.activeProductSignal()?.id === productId) {
            this.activeProductSignal.set(product);
        }
      },
      error: (err) => console.error('Failed to add batch to product:', err)
    });
  }
}
