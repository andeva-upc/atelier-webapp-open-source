export class GenerateVoucherCommand {
  constructor(
    public quoteId: string,
    public type: string,
    public customerDocumentType: string,
    public customerDocumentNumber: string,
    public customerName: string
  ) {}
}

export class CheckoutCommand {
  constructor(
    public quoteId: string,
    public type: string,
    public customerDocumentType: string,
    public customerDocumentNumber: string,
    public customerName: string,
    public method: string
  ) {}
}
