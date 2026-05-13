import { Injectable } from '@angular/core';
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { BaseResponse } from '../../shared/infrastructure/base-response';
import { Voucher, VoucherItem } from '../domain/models/voucher.entity';
import { VoucherResponse, VoucherItemResponse } from './vouchers-response';

/**
 * Bidirectional assembler for the Voucher aggregate.
 *
 * @remarks
 * Acts as the Anti-Corruption Layer (ACL) between infrastructure DTOs ({@link VoucherResponse})
 * and pure domain entities ({@link Voucher}), translating snake_case API fields to camelCase.
 */
@Injectable({ providedIn: 'root' })
export class VoucherAssembler implements BaseAssembler<Voucher, VoucherResponse, BaseResponse> {
  /**
   * Maps a raw {@link VoucherItemResponse} DTO to a domain {@link VoucherItem} value object.
   *
   * @param item - The raw item DTO from the API.
   * @returns A clean, immutable {@link VoucherItem} value object.
   */
  private toItemFromResponse(item: VoucherItemResponse): VoucherItem {
    return {
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      total: item.total,
    };
  }

  /**
   * Translates a network DTO resource into a clean {@link Voucher} domain entity.
   *
   * @param resource - The input {@link VoucherResponse} DTO.
   * @returns A new immutable {@link Voucher} domain entity.
   */
  toEntityFromResource(resource: VoucherResponse): Voucher {
    return new Voucher(
      resource.id,
      resource.workshop_id,
      resource.customer_id,
      resource.customer_name,
      resource.work_order_id,
      resource.voucher_number,
      resource.type,
      resource.status,
      (resource.items ?? []).map(i => this.toItemFromResponse(i)),
      resource.subtotal,
      resource.tax_amount,
      resource.total_amount,
      resource.issued_at,
      resource.due_date,
      resource.paid_at,
      resource.notes,
      resource.version
    );
  }

  /**
   * Translates a {@link Voucher} domain entity back into a {@link VoucherResponse} DTO.
   *
   * @param entity - The domain {@link Voucher} entity to serialize.
   * @returns The mapped {@link VoucherResponse} DTO for network transport.
   */
  toResourceFromEntity(entity: Voucher): VoucherResponse {
    return {
      id: entity.id,
      workshop_id: entity.workshopId,
      customer_id: entity.customerId,
      customer_name: entity.customerName,
      work_order_id: entity.workOrderId,
      voucher_number: entity.voucherNumber,
      type: entity.type,
      status: entity.status,
      items: entity.items.map(i => ({
        id: i.id,
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unitPrice,
        total: i.total,
      })),
      subtotal: entity.subtotal,
      tax_amount: entity.taxAmount,
      total_amount: entity.totalAmount,
      issued_at: entity.issuedAt,
      due_date: entity.dueDate,
      paid_at: entity.paidAt,
      notes: entity.notes,
      version: entity.version,
    };
  }

  /**
   * Transforms a raw backend response into a collection of {@link Voucher} entities.
   *
   * @param response - The raw {@link BaseResponse} returned by the HTTP service.
   * @returns An array of {@link Voucher} domain entities.
   */
  toEntitiesFromResponse(response: BaseResponse): Voucher[] {
    const raw = response as any;
    if (Array.isArray(raw)) {
      return raw.map(r => this.toEntityFromResource(r));
    }
    if (raw && Array.isArray(raw.vouchers)) {
      return raw.vouchers.map((r: VoucherResponse) => this.toEntityFromResource(r));
    }
    if (raw && Array.isArray(raw.data)) {
      return raw.data.map((r: VoucherResponse) => this.toEntityFromResource(r));
    }
    return [];
  }
}
