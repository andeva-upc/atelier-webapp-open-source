import { ProductBatchResponse } from './product-batch.response';

export interface ProductResponse {
  id: string;
  branchId: string;
  category: string;
  name: string;
  sku: string;
  description: string;
  currentSellingPrice: number;
  currentStock: number;
  minimumStock: number;
  batches?: ProductBatchResponse[];
  createdAt: string;
  updatedAt: string;
}
