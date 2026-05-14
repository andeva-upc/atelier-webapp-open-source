import { Observable } from 'rxjs';
import { InventoryItem } from '../models/inventory-item.entity';

/**
 * Domain Repository Contract defining the boundary for inventory operations.
 * Supports US008, US009, US010, US017.
 */
export abstract class InventoryRepository {
  /** US017: Retrieves all inventory items. */
  abstract getAll(): Observable<InventoryItem[]>;

  /** US017: Searches for inventory items based on a query. */
  abstract search(query: string): Observable<InventoryItem[]>;

  /** US008: Creates a new inventory item (spare part). */
  abstract create(item: InventoryItem): Observable<InventoryItem>;

  /** US009: Adjusts the stock of an existing item by a delta amount. */
  abstract adjustStock(id: string, newStock: number): Observable<InventoryItem>;
}
