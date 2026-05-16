import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Represents an item line within a billing voucher.
 *
 * @remarks
 * Value object encapsulating a single product/service entry in a voucher.
 */
export interface VoucherItem {
  /** Line item unique identifier */
  readonly id: string;
  /** Description of the product or service rendered */
  readonly description: string;
  /** Quantity of units */
  readonly quantity: number;
  /** Unit price in local currency */
  readonly unitPrice: number;
  /** Total computed for this line (quantity × unitPrice) */
  readonly total: number;
}

/**
 * Voucher status lifecycle enumeration.
 *
 * @remarks
 * A voucher transitions from PENDING → PAID or PENDING → CANCELLED.
 */
export type VoucherStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'OVERDUE';

/**
 * Voucher type classification.
 */
export type VoucherType = 'INVOICE' | 'RECEIPT' | 'CREDIT_NOTE';

/**
 * Domain entity representing a billing voucher (comprobante de pago).
 *
 * @remarks
 * Pure TypeScript class decoupled from any UI or infrastructure framework.
 * Encapsulates computed financial behaviour and business rules.
 */
export class Voucher implements BaseEntity {
  constructor(
    public readonly id: string,
    public readonly workshopId: string,
    public readonly customerId: string,
    public readonly customerName: string,
    public readonly workOrderId: string | null,
    public readonly voucherNumber: string,
    public readonly type: VoucherType,
    public readonly status: VoucherStatus,
    public readonly items: VoucherItem[],
    public readonly subtotal: number,
    public readonly taxAmount: number,
    public readonly totalAmount: number,
    public readonly issuedAt: string,
    public readonly dueDate: string | null,
    public readonly paidAt: string | null,
    public readonly notes: string | null,
    public readonly version: number
  ) {}

  /**
   * Computes the tax rate as a percentage (0–100) derived from subtotal and taxAmount.
   *
   * @returns Tax rate percentage, or 0 if subtotal is zero.
   */
  getTaxRatePercent(): number {
    if (this.subtotal === 0) return 0;
    return Math.round((this.taxAmount / this.subtotal) * 100);
  }

  /**
   * Returns a human-readable badge label for the current status.
   *
   * @returns Localizable status label key.
   */
  getStatusLabelKey(): string {
    const labels: Record<VoucherStatus, string> = {
      PENDING: 'billing.status.pending',
      PAID: 'billing.status.paid',
      CANCELLED: 'billing.status.cancelled',
      OVERDUE: 'billing.status.overdue',
    };
    return labels[this.status];
  }

  /**
   * Indicates whether this voucher can still be modified or cancelled.
   *
   * @returns True if the voucher is still in a mutable state.
   */
  isMutable(): boolean {
    return this.status === 'PENDING';
  }
}

