import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { InventoryStore } from '../../../application/inventory.store';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-product-selector',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, FormsModule, TranslateModule],
  templateUrl: './product-selector.html'
})
export class ProductSelectorComponent implements OnInit {
  @Input({ required: true }) branchId!: string;
  @Input() selectedProductId: string | null = null;
  @Input() disabled: boolean = false;
  
  @Output() productSelected = new EventEmitter<{id: string, name: string, stockQuantity: number, price: number}>();

  inventoryStore = inject(InventoryStore);

  ngOnInit() {
    this.inventoryStore.loadProductsByBranchId(this.branchId);
  }

  onSelectionChange(id: string) {
    const product = this.inventoryStore.branchProducts().find(p => p.id === id);
    if (product) {
      this.productSelected.emit({
        id: product.id,
        name: product.name,
        stockQuantity: product.currentStock,
        price: product.salePrice
      });
    }
  }
}
