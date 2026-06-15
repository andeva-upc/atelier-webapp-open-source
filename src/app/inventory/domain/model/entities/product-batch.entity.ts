export interface ProductBatch {
  batchId: string;
  productId: string;
  branchId: string;
  initialQuantity: number;
  availableQuantity: number;
  acquisitionCost: number;
  createdAt: string;
  updatedAt: string;
}
