export class AddProductToTaskCommand {
  constructor(
    public productId: string,
    public quantity: number,
    public unitPrice: number
  ) {}
}