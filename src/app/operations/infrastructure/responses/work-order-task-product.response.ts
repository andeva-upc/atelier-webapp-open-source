export interface WorkOrderTaskProductResource {
  id: string;
  productId: string;
  branchId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}