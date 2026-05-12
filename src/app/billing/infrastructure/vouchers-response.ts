import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * DTO representing a single item line in a billing voucher as returned by the API.
 */
export interface VoucherItemResponse {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

/**
 * DTO representing the raw network model of a billing voucher (comprobante de pago).
 *
 * @remarks
 * All field names follow the snake_case convention used by the backend JSON API.
 * The Assembler is responsible for mapping these to camelCase domain entities.
 */
export interface VoucherResponse extends BaseResource {
  id: string;
  workshop_id: string;
  customer_id: string;
  customer_name: string;
  work_order_id: string | null;
  voucher_number: string;
  type: 'INVOICE' | 'RECEIPT' | 'CREDIT_NOTE';
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'OVERDUE';
  items: VoucherItemResponse[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  issued_at: string;
  due_date: string | null;
  paid_at: string | null;
  notes: string | null;
  version: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Wrapper response envelope for a list of vouchers.
 */
export interface VouchersListResponse extends BaseResponse {
  vouchers: VoucherResponse[];
}
