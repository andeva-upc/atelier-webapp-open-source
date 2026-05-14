import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Domain model representing an inventory item (spare part).
 */
export class InventoryItem implements BaseEntity {
  constructor(
    public readonly id: string,
    public readonly workshopId: string,
    public readonly name: string,
    public readonly brand: string,
    public readonly category: string,
    public readonly stock: number,
    public readonly minStock: number,
    public readonly price: number,
    public readonly status: string,
    public readonly deletedAt?: string | Date
  ) {}

  /**
   * Business logic to determine if the item is in low stock.
   */
  isLowStock(): boolean {
    return this.stock <= this.minStock;
  }

  /**
   * Business logic to calculate the total value of the current stock.
   */
  getTotalValue(): number {
    return this.stock * this.price;
  }
}
