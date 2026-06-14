import { ProductBatch } from './product-batch.entity';

export interface Product {
  id: string;
  branchId: string;
  category: string;
  name: string;
  sku: string;
  description: string;
  salePrice: number;
  currentStock: number;
  minimumStock: number;
  batches?: ProductBatch[];
  createdAt: string;
  updatedAt: string;
}
