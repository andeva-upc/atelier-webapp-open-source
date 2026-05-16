import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { InventoryItem } from '../domain/models/inventory-item.entity';
import { InventoryRepository } from '../domain/repositories/inventory.repository';
import { InventoryApiEndpoint } from './inventory-api-endpoint';

/**
 * Infrastructure facade for inventory API operations.
 */
@Injectable({ providedIn: 'root' })
export class InventoryApi extends BaseApi implements InventoryRepository {
  private readonly inventoryEndpoint = inject(InventoryApiEndpoint);

  getAll(): Observable<InventoryItem[]> {
    return this.inventoryEndpoint.getAll();
  }

  search(query: string): Observable<InventoryItem[]> {
    const normalizedQuery = query.trim().toLowerCase();
    return this.getAll().pipe(
      map(items => {
        if (!normalizedQuery) return items;
        return items.filter(item =>
          item.name.toLowerCase().includes(normalizedQuery) ||
          item.category.toLowerCase().includes(normalizedQuery) ||
          item.id.toLowerCase().includes(normalizedQuery)
        );
      })
    );
  }

  /** US008: Delegates item creation to the endpoint. */
  create(item: InventoryItem): Observable<InventoryItem> {
    return this.inventoryEndpoint.create(item);
  }

  /** US009: Delegates stock adjustment to the endpoint. */
  adjustStock(id: string, newStock: number): Observable<InventoryItem> {
    return this.inventoryEndpoint.adjustStock(id, newStock);
  }
}
