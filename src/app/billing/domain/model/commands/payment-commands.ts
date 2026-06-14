export class AddPaymentCommand {
  constructor(
    public voucherId: string,
    public amount: number,
    public method: string
  ) {}
}

export class RemovePaymentCommand {
  constructor(
    public voucherId: string,
    public paymentId: string
  ) {}
}
