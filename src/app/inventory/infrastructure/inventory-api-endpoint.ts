import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { InventoryItem } from '../domain/models/inventory-item.entity';
import { InventoryAssembler } from './inventory-assembler';
import { BaseResponse } from '../../shared/infrastructure/base-response';
import { InventoryResponse } from './inventory-response';
import { InventoryRepository } from '../domain/repositories/inventory.repository';

/**
 * Infrastructure service for inventory management.
 * Implements InventoryRepository using BaseApiEndpoint following DDD patterns.
 */
@Injectable({
  providedIn: 'root',
})
export class InventoryApiEndpoint
  extends BaseApiEndpoint<InventoryItem, InventoryResponse, BaseResponse, InventoryAssembler>
  implements InventoryRepository {
  constructor() {
    const http = inject(HttpClient);
    const assembler = inject(InventoryAssembler);
    // Usamos el endpoint de /products que ya existe en el backend
    const baseUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderProductsEndpointPath}`;
    super(http, baseUrl, assembler);
  }

  /** US017 - Search with full-text query param */
  search(query: string): Observable<InventoryItem[]> {
    return this.find({ q: query });
  }

  /** US009 - Decrease stock via PATCH */
  decreaseStock(id: string, amount: number): Observable<InventoryItem> {
    return this.http.get<InventoryResponse>(`${this.endpointUrl}/${id}`).pipe(
      map(res => {
        const newQty = Math.max(0, res.stock - amount);
        this.http.patch<InventoryResponse>(`${this.endpointUrl}/${id}`, { stock: newQty }).subscribe();
        return this.assembler.toEntityFromResource({ ...res, stock: newQty });
      })
    );
  }

  /** US009 - Increase stock via PATCH */
  increaseStock(id: string, amount: number): Observable<InventoryItem> {
    return this.http.get<InventoryResponse>(`${this.endpointUrl}/${id}`).pipe(
      map(res => {
        const newQty = res.stock + amount;
        this.http.patch<InventoryResponse>(`${this.endpointUrl}/${id}`, { stock: newQty }).subscribe();
        return this.assembler.toEntityFromResource({ ...res, stock: newQty });
      })
    );
  }

  /** US008 - Register a new spare part via POST */
  override create(item: Partial<InventoryItem>): Observable<InventoryItem> {
    const payload: Partial<InventoryResponse> = {
      sku: item.sku,
      name: item.name,
      stock: item.quantity ?? 0,
      // Los campos opcionales solo se envían si existen para no ensuciar el endpoint /products
      ...(item.category && { category: item.category }),
      ...(item.brand && { brand: item.brand }),
      ...(item.minStock && { min_stock: item.minStock }),
      ...(item.unitPrice && { unit_price: item.unitPrice }),
    };
    return this.http.post<InventoryResponse>(this.endpointUrl, payload).pipe(
      map(res => this.assembler.toEntityFromResource(res))
    );
  }
}
