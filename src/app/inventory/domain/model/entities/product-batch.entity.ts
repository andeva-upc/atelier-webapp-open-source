export interface ProductBatch {
  id: string;
  productId: string;
  branchId: string;
  initialQuantity: number;
  availableQuantity: number;
  acquisitionCost: number;
  createdAt: string;
  updatedAt: string;
}
