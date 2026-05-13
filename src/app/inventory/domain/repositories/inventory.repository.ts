import { Observable } from 'rxjs';
import { InventoryItem } from '../models/inventory-item.entity';

export abstract class InventoryRepository {
  /** Retrieves all inventory items. */
  abstract getAll(): Observable<InventoryItem[]>;

  /** Searches for inventory items matching the given query string (US017). */
  abstract search(query: string): Observable<InventoryItem[]>;

  /** Decreases the stock for a specific item (US009). */
  abstract decreaseStock(id: string, amount: number): Observable<InventoryItem>;

  /** Increases the stock for a specific item (US009). */
  abstract increaseStock(id: string, amount: number): Observable<InventoryItem>;

  /** Registers a new spare part in the inventory (US008). */
  abstract create(item: Partial<InventoryItem>): Observable<InventoryItem>;
}
