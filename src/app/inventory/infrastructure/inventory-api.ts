import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { InventoryRepository } from '../domain/repositories/inventory.repository';
import { InventoryApiEndpoint } from './inventory-api-endpoint';
import { InventoryItem } from '../domain/models/inventory-item.entity';

@Injectable({
  providedIn: 'root',
})
export class InventoryApi extends BaseApi implements InventoryRepository {
  private readonly endpoint = inject(InventoryApiEndpoint);

  getAll(): Observable<InventoryItem[]> {
    return this.endpoint.getAll();
  }

  search(query: string): Observable<InventoryItem[]> {
    return this.endpoint.search(query);
  }

  decreaseStock(id: string, amount: number): Observable<InventoryItem> {
    return this.endpoint.decreaseStock(id, amount);
  }

  increaseStock(id: string, amount: number): Observable<InventoryItem> {
    return this.endpoint.increaseStock(id, amount);
  }

  create(item: Partial<InventoryItem>): Observable<InventoryItem> {
    return this.endpoint.create(item);
  }
}
