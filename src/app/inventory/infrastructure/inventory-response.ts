export interface InventoryResponse {
  id: string;
  sku: string;
  name: string;
  stock: number; // Campo real en el endpoint /products
  workshop_id?: string;
  category?: string;
  brand?: string;
  min_stock?: number;
  unit_price?: number;
}
