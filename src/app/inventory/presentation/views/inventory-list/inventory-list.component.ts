import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InventoryStore, NewItemForm } from '../../../application/inventory.store';

/**
 * View component for the Inventory module.
 * Implements US008 (create), US009 (stock adjust), US010 (alerts), US017 (search+filter).
 */
@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.css'
})
export class InventoryListComponent implements OnInit {
  protected readonly store = inject(InventoryStore);

  // — US008: Add form modal state —
  protected isModalOpen = signal(false);
  protected isSaving = signal(false);
  protected formData: NewItemForm = this.emptyForm();

  ngOnInit(): void {
    this.store.loadItems();
  }

  // ——————————————————————————————
  // US017: Search & Filter
  // ——————————————————————————————

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.store.updateSearchQuery(input.value);
  }

  onCategoryChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.store.updateCategoryFilter(select.value);
  }

  // ——————————————————————————————
  // US009: Stock Adjustment
  // ——————————————————————————————

  onAdjustStock(itemId: string, delta: number): void {
    this.store.adjustStock(itemId, delta);
  }

  // ——————————————————————————————
  // US008: Create New Item
  // ——————————————————————————————

  openModal(): void {
    this.formData = this.emptyForm();
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  onSubmitForm(): void {
    if (!this.formData.name || !this.formData.sku || !this.formData.category) return;
    this.store.createItem(this.formData, () => {
      this.closeModal();
    });
  }

  private emptyForm(): NewItemForm {
    return { name: '', sku: '', category: '', stock: 0, minStock: 5, price: 0 };
  }
}
