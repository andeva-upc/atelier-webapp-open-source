import { BaseResource } from '../../../shared/infrastructure/base-response';

/**
 * DTO representing the backend product response.
 * Extends BaseResource to satisfy the BaseApiEndpoint contract.
 */
export interface ProductResponse extends BaseResource {
  id: string;
  workshop_id: string;
  sku: string;
  name: string;
  category: string;
  unit_price: number;
  unit_cost: number;
  current_stock: number;
  minimum_stock: number;
  deleted_at?: string | null;
}
