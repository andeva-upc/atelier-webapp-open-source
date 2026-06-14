export interface UpdateProductCommand {
  category: string;
  name: string;
  sku: string;
  description: string;
  salePrice: number;
  minimumStock: number;
}
