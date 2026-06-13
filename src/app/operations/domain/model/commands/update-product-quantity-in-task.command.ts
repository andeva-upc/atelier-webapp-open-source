export class UpdateProductQuantityInTaskCommand {
  constructor(
    public productId: string,
    public newQuantity: number
  ) {}
}