import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryStore } from '../../../../application/inventory.store';
import { ProductFormComponent } from '../../components/product-form/product-form';
import { CreateProductCommand } from '../../../../domain/model/commands/create-product.command';
import { UpdateProductCommand } from '../../../../domain/model/commands/update-product.command';

@Component({
  selector: 'app-product-form-view',
  standalone: true,
  imports: [CommonModule, ProductFormComponent],
  templateUrl: './product-form-view.html',
  styleUrls: ['./product-form-view.css']
})
export class ProductFormViewComponent implements OnInit {
  private store = inject(InventoryStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = false;
  productId: string | null = null;
  
  // Expose the active product from the store to the template
  activeProduct = this.store.activeProduct;

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEditMode = true;
      this.store.loadProductById(this.productId);
    }
  }

  onSave(formData: any): void {
    if (this.isEditMode && this.productId) {
      const command: UpdateProductCommand = { ...formData };
      this.store.updateProduct(this.productId, command);
      this.router.navigate(['/inventory/products', this.productId]);
    } else {
      // Mocking branchId again for creation
      const mockBranchId = '90ce7890-482d-4f27-a006-dc2a3be6be3f';
      const command: CreateProductCommand = { branchId: mockBranchId, ...formData };
      this.store.createProduct(command);
      this.router.navigate(['/inventory']);
    }
  }

  onCancel(): void {
    if (this.isEditMode && this.productId) {
      this.router.navigate(['/inventory/products', this.productId]);
    } else {
      this.router.navigate(['/inventory']);
    }
  }
}
