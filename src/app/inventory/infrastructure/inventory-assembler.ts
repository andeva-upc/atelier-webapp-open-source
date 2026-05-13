import { Injectable } from '@angular/core';
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { BaseResponse } from '../../shared/infrastructure/base-response';
import { InventoryItem } from '../domain/models/inventory-item.entity';
import { InventoryResponse } from './inventory-response';

@Injectable({
  providedIn: 'root',
})
export class InventoryAssembler implements BaseAssembler<InventoryItem, InventoryResponse, BaseResponse> {
  toEntityFromResource(resource: InventoryResponse): InventoryItem {
    return new InventoryItem(
      resource.id,
      resource.sku,
      resource.category ?? '', // Fallback para campos no presentes en /products
      resource.name,
      resource.brand ?? '',
      resource.stock, // Mapeo de stock -> quantity
      resource.min_stock ?? 0,
      resource.unit_price ?? 0
    );
  }

  toResourceFromEntity(entity: InventoryItem): InventoryResponse {
    return {
      id: entity.id,
      sku: entity.sku,
      category: entity.category,
      name: entity.name,
      brand: entity.brand,
      stock: entity.quantity, // Mapeo de quantity -> stock
      min_stock: entity.minStock,
      unit_price: entity.unitPrice,
    };
  }

  toEntitiesFromResponse(response: BaseResponse): InventoryItem[] {
    const raw = response as any;
    if (Array.isArray(raw)) {
      return raw.map((res: InventoryResponse) => this.toEntityFromResource(res));
    }
    if (raw && Array.isArray(raw.data)) {
      return raw.data.map((res: InventoryResponse) => this.toEntityFromResource(res));
    }
    return [];
  }
}
