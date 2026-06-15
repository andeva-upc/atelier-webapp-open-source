export class Payment {
  id?: string;
  amount: number;
  method: string;

  constructor(amount: number, method: string, id?: string) {
    this.amount = amount;
    this.method = method;
    this.id = id;
  }
}
