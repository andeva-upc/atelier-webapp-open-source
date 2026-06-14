import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ProductsApiEndpoint } from '../../../infrastructure/endpoints/products.endpoint';
import { ProductResponse } from '../../../infrastructure/responses/product.response';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    TranslateModule,
    MatTableModule, 
    MatButtonModule, 
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule
  ],
  templateUrl: './inventory-list.html',
  styleUrls: ['./inventory-list.css']
})
export class InventoryListComponent implements OnInit {
  displayedColumns: string[] = ['sku', 'name', 'category', 'stock', 'price', 'actions'];
  dataSource: ProductResponse[] = [];
  filteredData: ProductResponse[] = [];
  
  private productsApi = inject(ProductsApiEndpoint);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    // We are currently mocking the branchId until the auth context provides it.
    const mockBranchId = '90ce7890-482d-4f27-a006-dc2a3be6be3f';
    this.productsApi.getByBranchId(mockBranchId).subscribe({
      next: (products) => {
        this.dataSource = products;
        this.filteredData = products;
      },
      error: (err) => console.error('Error loading products', err)
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredData = this.dataSource.filter(product => 
      product.name.toLowerCase().includes(filterValue) || 
      product.sku.toLowerCase().includes(filterValue) ||
      product.category.toLowerCase().includes(filterValue)
    );
  }

  deleteProduct(productId: string) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productsApi.delete(productId).subscribe(() => {
        this.loadProducts();
      });
    }
  }
}
