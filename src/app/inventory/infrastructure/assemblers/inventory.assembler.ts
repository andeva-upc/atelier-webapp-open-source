import { Injectable } from '@angular/core';
import { InventoryItem } from '../../domain/models/inventory-item.entity';
import { BaseAssembler } from '../../../shared/infrastructure/base-assembler';
import { BaseResponse } from '../../../shared/infrastructure/base-response';
import { ProductResponse } from '../models/inventory.response';

/**
 * Assembler that maps ProductResponse DTOs to InventoryItem domain entities.
 * Implements the BaseAssembler interface for use with BaseApiEndpoint.
 */
@Injectable({ providedIn: 'root' })
export class InventoryAssembler implements BaseAssembler<InventoryItem, ProductResponse, BaseResponse> {

  /**
   * Maps a ProductResponse DTO to an InventoryItem entity.
   */
  toEntityFromResource(resource: ProductResponse): InventoryItem {
    return new InventoryItem(
      resource.id,
      resource.workshop_id,
      resource.name,
      '',           // brand not available in products endpoint
      resource.category,
      resource.current_stock,
      resource.minimum_stock,
      resource.unit_price,
      resource.current_stock <= resource.minimum_stock ? 'LOW_STOCK' : 'OK'
    );
  }

  /**
   * Not used for read-only inventory, but required by the interface.
   */
  toResourceFromEntity(entity: InventoryItem): ProductResponse {
    return {
      id: entity.id,
      workshop_id: entity.workshopId,
      name: entity.name,
      sku: entity.id,
      category: entity.category,
      unit_price: entity.price,
      unit_cost: 0,
      current_stock: entity.stock,
      minimum_stock: entity.minStock,
    };
  }

  /**
   * Not used (API returns a plain array, not a wrapped response).
   */
  toEntitiesFromResponse(_response: BaseResponse): InventoryItem[] {
    return [];
  }
}
