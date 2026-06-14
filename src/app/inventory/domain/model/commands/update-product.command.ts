export interface UpdateProductCommand {
  category: string;
  name: string;
  sku: string;
  description: string;
  currentSellingPrice: number;
  minimumStock: number;
}
