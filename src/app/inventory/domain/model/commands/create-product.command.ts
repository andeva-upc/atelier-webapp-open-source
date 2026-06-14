export interface CreateProductCommand {
  branchId: string;
  category: string;
  name: string;
  sku: string;
  description: string;
  salePrice: number;
  minimumStock: number;
}
