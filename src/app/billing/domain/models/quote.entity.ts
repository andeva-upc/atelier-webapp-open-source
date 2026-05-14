import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Represents a single line item within a quotation.
 */
export interface QuoteItem {
  /** Line item unique identifier */
  readonly id: string;
  /** Description of the product or service quoted */
  readonly description: string;
  /** Quantity of units */
  readonly quantity: number;
  /** Estimated unit price */
  readonly unitPrice: number;
  /** Total for this line (quantity × unitPrice) */
  readonly total: number;
}

/**
 * Quotation lifecycle status.
 */
export type QuoteStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

/**
 * Domain entity representing a commercial quotation (cotización).
 *
 * @remarks
 * Pure TypeScript class decoupled from any UI or infrastructure framework.
 * Quotations may evolve into vouchers once approved by the customer.
 */
export class Quote implements BaseEntity {
  constructor(
    public readonly id: string,
    public readonly workshopId: string,
    public readonly customerId: string,
    public readonly customerName: string,
    public readonly quoteNumber: string,
    public readonly status: QuoteStatus,
    public readonly items: QuoteItem[],
    public readonly subtotal: number,
    public readonly taxAmount: number,
    public readonly totalAmount: number,
    public readonly validUntil: string,
    public readonly createdAt: string,
    public readonly approvedAt: string | null,
    public readonly notes: string | null,
    public readonly version: number
  ) {}

  /**
   * Determines if this quotation has expired based on the current date.
   *
   * @returns True if the valid-until date is in the past.
   */
  isExpired(): boolean {
    return new Date(this.validUntil) < new Date();
  }

  /**
   * Returns a human-readable badge label key for the current status.
   *
   * @returns i18n key for status display.
   */
  getStatusLabelKey(): string {
    const labels: Record<QuoteStatus, string> = {
      DRAFT: 'billing.quote.status.draft',
      SENT: 'billing.quote.status.sent',
      APPROVED: 'billing.quote.status.approved',
      REJECTED: 'billing.quote.status.rejected',
      EXPIRED: 'billing.quote.status.expired',
    };
    return labels[this.status];
  }

  /**
   * Indicates whether this quote can be approved or rejected.
   *
   * @returns True if the quote is in an actionable state.
   */
  isActionable(): boolean {
    return this.status === 'SENT' && !this.isExpired();
  }
}
