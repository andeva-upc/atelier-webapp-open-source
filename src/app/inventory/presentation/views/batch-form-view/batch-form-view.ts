import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryStore } from '../../../application/inventory.store';
import { BatchFormComponent } from '../../components/batch-form/batch-form';
import { AddBatchToProductCommand } from '../../../domain/model/commands/add-batch-to-product.command';

@Component({
  selector: 'app-batch-form-view',
  standalone: true,
  imports: [CommonModule, TranslateModule, BatchFormComponent],
  templateUrl: './batch-form-view.html',
  styleUrls: ['./batch-form-view.css']
})
export class BatchFormViewComponent implements OnInit {
  private store = inject(InventoryStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  productId: string | null = null;
  activeProduct = this.store.activeProduct;

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.store.loadProductById(this.productId);
    }
  }

  onSave(formData: any): void {
    if (this.productId) {
      const command: AddBatchToProductCommand = {
        quantity: formData.initialQuantity,
        acquisitionCost: formData.acquisitionCost
      };
      
      this.store.addBatchToProduct(this.productId, command).subscribe({
        next: () => {
          this.router.navigate(['/inventory/products', this.productId, 'batches']);
        }
      });
    }
  }

  onCancel(): void {
    if (this.productId) {
      this.router.navigate(['/inventory/products', this.productId, 'batches']);
    } else {
      this.router.navigate(['/inventory']);
    }
  }
}
