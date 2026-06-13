export class WorkOrderTaskProduct {
  id: string;
  productId: string;
  branchId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;

  constructor() {
    this.id = '';
    this.productId = '';
    this.branchId = '';
    this.quantity = 0;
    this.unitPrice = 0;
    this.totalAmount = 0;
  }
}
