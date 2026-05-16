import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { BaseResponse } from '../../shared/infrastructure/base-response';
import { environment } from '../../../environments/environment';
import { InventoryItem } from '../domain/models/inventory-item.entity';
import { InventoryAssembler } from './assemblers/inventory.assembler';
import { ProductResponse } from './models/inventory.response';

/**
 * HTTP endpoint for inventory (products) operations.
 * Reads from the existing /products endpoint.
 */
@Injectable({ providedIn: 'root' })
export class InventoryApiEndpoint extends BaseApiEndpoint<
  InventoryItem,
  ProductResponse,
  BaseResponse,
  InventoryAssembler
> {
  constructor() {
    const http = inject(HttpClient);
    const assembler = inject(InventoryAssembler);
    const url = `${environment.platformProviderApiBaseUrl}${environment.platformProviderProductsEndpointPath}`;
    super(http, url, assembler);
  }

  override getAll(): Observable<InventoryItem[]> {
    return super.getAll();
  }

  /**
   * US009: Adjusts the stock of an item via PATCH on current_stock.
   */
  adjustStock(id: string, newStock: number): Observable<InventoryItem> {
    return this.patch(id, { current_stock: newStock } as Partial<ProductResponse>);
  }

  /**
   * US008: Creates a new product (spare part).
   */
  override create(item: InventoryItem): Observable<InventoryItem> {
    return super.create(item);
  }
}
