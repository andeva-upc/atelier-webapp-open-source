export class InventoryItem {
  constructor(
    public readonly id: string,
    public readonly sku: string,
    public readonly category: string,
    public readonly name: string,
    public readonly brand: string,
    public readonly quantity: number,
    public readonly minStock: number,
    public readonly unitPrice: number
  ) { }

  /**
   * Evaluates if the item is currently running low on stock.
   */
  isLowStock(): boolean {
    return this.quantity <= this.minStock;
  }

  /**
   * Computes the total monetary value of the current stock for this item.
   */
  getTotalValue(): number {
    return this.quantity * this.unitPrice;
  }
}
