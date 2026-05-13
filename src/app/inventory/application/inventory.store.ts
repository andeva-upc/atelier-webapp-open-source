import { Injectable, computed, signal, inject } from '@angular/core';
import { InventoryItem } from '../domain/models/inventory-item.entity';
import { InventoryRepository } from '../domain/repositories/inventory.repository';

@Injectable({
  providedIn: 'root',
})
export class InventoryStore {
  private readonly repository = inject(InventoryRepository);

  private readonly itemsSignal = signal<InventoryItem[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly savingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  private readonly currentPageSignal = signal<number>(1);
  private readonly pageSizeSignal = signal<number>(8);
  private readonly searchQuerySignal = signal<string>('');
  private readonly filterCategorySignal = signal<string>('');
  private readonly sortDirectionSignal = signal<'asc' | 'desc'>('asc');

  readonly items = this.itemsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly saving = this.savingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly currentPage = this.currentPageSignal.asReadonly();
  readonly filterCategory = this.filterCategorySignal.asReadonly();

  /** US017 - Available categories derived from loaded items */
  readonly categories = computed(() => {
    const cats = [...new Set(this.itemsSignal().map(i => i.category))].sort();
    return cats;
  });

  /** US017 - Client-side filter by category */
  readonly filteredItems = computed(() => {
    let items = this.itemsSignal();
    const cat = this.filterCategorySignal();
    if (cat) items = items.filter(i => i.category === cat);
    const dir = this.sortDirectionSignal() === 'asc' ? 1 : -1;
    return [...items].sort((a, b) => a.name.localeCompare(b.name) * dir);
  });

  readonly paginatedItems = computed(() => {
    const items = this.filteredItems();
    const page = this.currentPageSignal();
    const size = this.pageSizeSignal();
    return items.slice((page - 1) * size, page * size);
  });

  readonly totalPages = computed(() =>
    Math.ceil(this.filteredItems().length / this.pageSizeSignal()) || 1
  );

  /** US010 - Low stock items for alert banner */
  readonly lowStockItems = computed(() =>
    this.itemsSignal().filter(i => i.isLowStock())
  );
  readonly lowStockItemsCount = computed(() => this.lowStockItems().length);

  readonly totalInventoryValue = computed(() =>
    this.itemsSignal().reduce((acc, i) => acc + i.getTotalValue(), 0)
  );

  readonly itemsCount = computed(() => this.itemsSignal().length);

  loadInventory(query: string = ''): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    const apiCall = query ? this.repository.search(query) : this.repository.getAll();
    apiCall.subscribe({
      next: data => {
        this.itemsSignal.set(data);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.loadingSignal.set(false);
        this.errorSignal.set(err.message || 'Error loading inventory');
      },
    });
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPageSignal.set(page);
    }
  }

  toggleSort(): void {
    this.sortDirectionSignal.update(d => d === 'asc' ? 'desc' : 'asc');
    this.currentPageSignal.set(1);
  }

  /** US017 - Filter by category */
  setFilter(category: string): void {
    this.filterCategorySignal.set(category);
    this.currentPageSignal.set(1);
  }

  /** US009 - Decrease stock and sync with API */
  decreaseStock(id: string, amount: number = 1): void {
    this.repository.decreaseStock(id, amount).subscribe({
      next: updated => {
        this.itemsSignal.update(items =>
          items.map(i => i.id === updated.id ? updated : i)
        );
      },
    });
  }

  /** US009 - Increase stock and sync with API */
  increaseStock(id: string, amount: number = 1): void {
    this.repository.increaseStock(id, amount).subscribe({
      next: updated => {
        this.itemsSignal.update(items =>
          items.map(i => i.id === updated.id ? updated : i)
        );
      },
    });
  }

  /** US008 - Register new spare part */
  createItem(item: Partial<InventoryItem>, onSuccess?: () => void): void {
    this.savingSignal.set(true);
    this.errorSignal.set(null);
    this.repository.create(item).subscribe({
      next: created => {
        this.itemsSignal.update(list => [...list, created]);
        this.savingSignal.set(false);
        if (onSuccess) onSuccess();
      },
      error: err => {
        this.savingSignal.set(false);
        this.errorSignal.set(err.message || 'Error creating item');
      },
    });
  }
}
