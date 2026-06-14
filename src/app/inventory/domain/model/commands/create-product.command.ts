export interface CreateProductCommand {
  branchId: string;
  category: string;
  name: string;
  sku: string;
  description: string;
  currentSellingPrice: number;
  minimumStock: number;
}
