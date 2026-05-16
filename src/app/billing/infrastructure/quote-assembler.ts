import { Injectable } from '@angular/core';
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { BaseResponse } from '../../shared/infrastructure/base-response';
import { Quote, QuoteItem } from '../domain/models/quote.entity';
import { QuoteResponse, QuoteItemResponse } from './quotes-response';

/**
 * Bidirectional assembler for the Quote aggregate.
 *
 * @remarks
 * Acts as the Anti-Corruption Layer (ACL) between infrastructure DTOs ({@link QuoteResponse})
 * and pure domain entities ({@link Quote}), translating snake_case API fields to camelCase.
 */
@Injectable({ providedIn: 'root' })
export class QuoteAssembler implements BaseAssembler<Quote, QuoteResponse, BaseResponse> {
  /**
   * Maps a raw {@link QuoteItemResponse} DTO to a domain {@link QuoteItem} value object.
   *
   * @param item - The raw item DTO.
   * @returns A clean, immutable {@link QuoteItem} value object.
   */
  private toItemFromResponse(item: QuoteItemResponse): QuoteItem {
    return {
      id: item.id,
      type: item.type,
      referenceId: item.reference_id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      total: item.total,
    };
  }

  /**
   * Translates a network DTO resource into a clean {@link Quote} domain entity.
   *
   * @param resource - The input {@link QuoteResponse} DTO.
   * @returns A new immutable {@link Quote} domain entity.
   */
  toEntityFromResource(resource: QuoteResponse): Quote {
    return new Quote(
      resource.id,
      resource.workshop_id,
      resource.customer_id,
      resource.customer_name,
      resource.quote_number,
      resource.status,
      (resource.items ?? []).map(i => this.toItemFromResponse(i)),
      resource.subtotal,
      resource.discount_amount,
      resource.tax_rate,
      resource.tax_amount,
      resource.total_amount,
      resource.valid_until,
      resource.created_at,
      resource.approved_at,
      resource.notes,
      resource.vehicle,
      resource.version
    );
  }

  /**
   * Translates a {@link Quote} domain entity back into a {@link QuoteResponse} DTO.
   *
   * @param entity - The domain {@link Quote} entity to serialize.
   * @returns The mapped {@link QuoteResponse} DTO for network transport.
   */
  toResourceFromEntity(entity: Quote): QuoteResponse {
    return {
      id: entity.id,
      workshop_id: entity.workshopId,
      customer_id: entity.customerId,
      customer_name: entity.customerName,
      quote_number: entity.quoteNumber,
      status: entity.status,
      items: entity.items.map(i => ({
        id: i.id,
        type: i.type,
        reference_id: i.referenceId,
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unitPrice,
        total: i.total,
      })),
      subtotal: entity.subtotal,
      discount_amount: entity.discountAmount,
      tax_rate: entity.taxRate,
      tax_amount: entity.taxAmount,
      total_amount: entity.totalAmount,
      valid_until: entity.validUntil,
      created_at: entity.createdAt,
      approved_at: entity.approvedAt,
      notes: entity.notes,
      vehicle: entity.vehicle,
      version: entity.version,
    };
  }

  /**
   * Transforms a raw backend response into a collection of {@link Quote} entities.
   *
   * @param response - The raw {@link BaseResponse} returned by the HTTP service.
   * @returns An array of {@link Quote} domain entities.
   */
  toEntitiesFromResponse(response: BaseResponse): Quote[] {
    const raw = response as any;
    if (Array.isArray(raw)) {
      return raw.map(r => this.toEntityFromResource(r));
    }
    if (raw && Array.isArray(raw.quotes)) {
      return raw.quotes.map((r: QuoteResponse) => this.toEntityFromResource(r));
    }
    if (raw && Array.isArray(raw.data)) {
      return raw.data.map((r: QuoteResponse) => this.toEntityFromResource(r));
    }
    return [];
  }
}

