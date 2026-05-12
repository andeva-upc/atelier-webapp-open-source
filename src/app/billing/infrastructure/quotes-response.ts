import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * DTO representing a single item line in a quotation as returned by the API.
 */
export interface QuoteItemResponse {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

/**
 * DTO representing the raw network model of a commercial quotation (cotización).
 *
 * @remarks
 * All field names follow the snake_case convention used by the backend JSON API.
 */
export interface QuoteResponse extends BaseResource {
  id: string;
  workshop_id: string;
  customer_id: string;
  customer_name: string;
  quote_number: string;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  items: QuoteItemResponse[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  valid_until: string;
  created_at: string;
  approved_at: string | null;
  notes: string | null;
  version: number;
  updated_at?: string;
}

/**
 * Wrapper response envelope for a list of quotations.
 */
export interface QuotesListResponse extends BaseResponse {
  quotes: QuoteResponse[];
}
