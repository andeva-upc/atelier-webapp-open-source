import { Injectable, computed, signal, inject } from '@angular/core';
import { InventoryItem } from '../domain/models/inventory-item.entity';
import { InventoryRepository } from '../domain/repositories/inventory.repository';

/**
 * Form data for creating a new spare part (US008).
 */
export interface NewItemForm {
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
}

/**
 * Application service managing inventory domain state and orchestration using Signals.
 * Implements US008, US009, US010, US017.
 */
@Injectable({ providedIn: 'root' })
export class InventoryStore {
  private readonly repository = inject(InventoryRepository);

  // — State signals —
  private readonly itemsSignal = signal<InventoryItem[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly savingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly searchQuerySignal = signal<string>('');
  private readonly categoryFilterSignal = signal<string>('');

  // — Public readonly signals —
  readonly items = this.itemsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly saving = this.savingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly searchQuery = this.searchQuerySignal.asReadonly();
  readonly categoryFilter = this.categoryFilterSignal.asReadonly();

  // — US017: Computed filtered items (search + category) —
  readonly filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.categoryFilter().toLowerCase().trim();
    return this.items().filter(item => {
      const matchesQuery = !query ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        String(item.id).toLowerCase().includes(query);
      const matchesCategory = !cat || item.category.toLowerCase() === cat;
      return matchesQuery && matchesCategory;
    });
  });

  // — US010: Low stock computed signals —
  readonly lowStockItemsCount = computed(() =>
    this.items().filter(item => item.isLowStock()).length
  );
  readonly lowStockItems = computed(() =>
    this.items().filter(item => item.isLowStock())
  );

  // — Summary KPIs —
  readonly totalItemsCount = computed(() => this.items().length);

  /** US017: All unique categories for filter dropdown. */
  readonly categories = computed(() =>
    [...new Set(this.items().map(item => item.category))].sort()
  );

  // ——————————————————————————————————————————
  // Actions
  // ——————————————————————————————————————————

  /** Loads all inventory items from the backend. */
  loadItems(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.repository.getAll().subscribe({
      next: items => {
        this.itemsSignal.set(items);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.loadingSignal.set(false);
        this.errorSignal.set('No se pudo cargar el inventario.');
        console.error(err);
      },
    });
  }

  /** US017: Updates the text search query. */
  updateSearchQuery(query: string): void {
    this.searchQuerySignal.set(query);
  }

  /** US017: Updates the category filter. */
  updateCategoryFilter(category: string): void {
    this.categoryFilterSignal.set(category);
  }

  /**
   * US008: Creates a new spare part and reloads the list on success.
   */
  createItem(form: NewItemForm, onSuccess?: () => void): void {
    this.savingSignal.set(true);
    this.errorSignal.set(null);

    const newItem = new InventoryItem(
      `p-${Date.now()}`,                   // temp id, overridden by backend
      '',
      form.name,
      '',
      form.category,
      form.stock,
      form.minStock,
      form.price,
      form.stock <= form.minStock ? 'LOW_STOCK' : 'OK'
    );

    this.repository.create(newItem).subscribe({
      next: () => {
        this.savingSignal.set(false);
        this.loadItems();
        onSuccess?.();
      },
      error: err => {
        this.savingSignal.set(false);
        this.errorSignal.set('No se pudo crear el repuesto.');
        console.error(err);
      },
    });
  }

  /**
   * US009: Adjusts stock for an item optimistically, then syncs with backend.
   */
  adjustStock(id: string, delta: number): void {
    const current = this.itemsSignal();
    const target = current.find(i => i.id === id);
    if (!target) return;

    const newStock = Math.max(0, target.stock + delta);

    // Optimistic update — update UI immediately
    this.itemsSignal.update(list =>
      list.map(i => i.id === id
        ? new InventoryItem(i.id, i.workshopId, i.name, i.brand, i.category, newStock, i.minStock, i.price, newStock <= i.minStock ? 'LOW_STOCK' : 'OK')
        : i
      )
    );

    // Sync with backend
    this.repository.adjustStock(id, newStock).subscribe({
      error: err => {
        // Rollback on failure
        this.itemsSignal.set(current);
        console.error('Stock adjustment failed', err);
      },
    });
  }
}
