export class CreateQuoteCommand {
  constructor(
    public workOrderId: string,
    public branchId: string,
    public discountPercentage: number
  ) {}
}

export class UpdateQuoteDiscountCommand {
  constructor(
    public quoteId: string,
    public discountPercentage: number
  ) {}
}

export class ApproveQuoteCommand {
  constructor(public quoteId: string) {}
}

export class CancelQuoteCommand {
  constructor(public quoteId: string) {}
}
