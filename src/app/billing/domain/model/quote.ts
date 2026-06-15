export class Quote {
  id: string;
  workOrderId: string;
  branchId: string;
  subtotalAmount: number;
  discountPercentage: number;
  totalAmount: number;
  status: string;

  constructor(
    id: string,
    workOrderId: string,
    branchId: string,
    subtotalAmount: number,
    discountPercentage: number,
    totalAmount: number,
    status: string
  ) {
    this.id = id;
    this.workOrderId = workOrderId;
    this.branchId = branchId;
    this.subtotalAmount = subtotalAmount;
    this.discountPercentage = discountPercentage;
    this.totalAmount = totalAmount;
    this.status = status;
  }
}
