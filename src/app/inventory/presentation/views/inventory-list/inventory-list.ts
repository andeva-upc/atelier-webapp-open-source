import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  matInventory2Outline,
  matWarningAmberOutline,
  matAddOutline,
  matSearchOutline,
  matFilterAltOutline,
  matRemoveOutline,
} from '@ng-icons/material-icons/outline';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { InventoryStore } from '../../../application/inventory.store';
import { Modal } from '../../../../shared/presentation/modal/modal';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    NgIcon,
    TranslateModule,
    Modal,
  ],
  providers: [
    provideIcons({
      matInventory2Outline,
      matWarningAmberOutline,
      matAddOutline,
      matRemoveOutline,
      matSearchOutline,
      matFilterAltOutline,
    }),
  ],
  templateUrl: './inventory-list.html',
  styleUrl: './inventory-list.css',
})
export class InventoryList implements OnInit {
  readonly store = inject(InventoryStore);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly items = this.store.paginatedItems;
  readonly isLoading = this.store.loading;
  readonly isSaving = this.store.saving;
  readonly totalItemsCount = this.store.itemsCount;
  readonly lowStockItems = this.store.lowStockItems;
  readonly lowStockCount = this.store.lowStockItemsCount;
  readonly categories = this.store.categories;
  readonly filterCategory = this.store.filterCategory;

  readonly isModalOpen = signal<boolean>(false);
  readonly searchQuery = signal<string>('');

  private readonly searchSubject = new Subject<string>();

  /** US008 - Reactive form for adding a new spare part */
  addForm: FormGroup = this.fb.group({
    sku: ['', [Validators.required, Validators.minLength(2)]],
    name: ['', [Validators.required, Validators.minLength(3)]],
    category: ['', Validators.required],
    brand: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(0)]],
    minStock: [1, [Validators.required, Validators.min(1)]],
    unitPrice: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.store.loadInventory(query);
    });
    this.store.loadInventory('');
  }

  /** US017 - Search */
  onSearchInput(event: Event): void {
    this.searchSubject.next((event.target as HTMLInputElement).value.trim());
  }

  /** US017 - Filter by category */
  onFilterChange(event: Event): void {
    this.store.setFilter((event.target as HTMLSelectElement).value);
  }

  /** US009 - Decrease stock */
  decreaseStock(id: string): void {
    this.store.decreaseStock(id, 1);
  }

  /** US009 - Increase stock */
  increaseStock(id: string): void {
    this.store.increaseStock(id, 1);
  }

  /** US008 - Open add modal */
  openModal(): void {
    this.addForm.reset({ quantity: 0, minStock: 1, unitPrice: 0 });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  /** US008 - Submit new spare part */
  onSave(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    const value = this.addForm.value;
    this.store.createItem(
      {
        sku: value.sku,
        name: value.name,
        category: value.category,
        brand: value.brand,
        quantity: value.quantity,
        minStock: value.minStock,
        unitPrice: value.unitPrice,
      },
      () => this.closeModal()
    );
  }

  getLowStockNames(): string {
    return this.lowStockItems().map(i => i.name).join(', ');
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.addForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }
}
