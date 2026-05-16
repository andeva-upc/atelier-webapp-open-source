import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { BaseResponse } from '../../shared/infrastructure/base-response';
import { Voucher } from '../domain/models/voucher.entity';
import { VoucherResponse } from './vouchers-response';
import { VoucherAssembler } from './voucher-assembler';
import { environment } from '../../../environments/environment';

/**
 * HTTP client for voucher API operations.
 *
 * @remarks
 * Inherits generic CRUD operations from {@link BaseApiEndpoint} and provides
 * billing-specific patch operations for status management.
 */
@Injectable({ providedIn: 'root' })
export class VouchersApiEndpoint extends BaseApiEndpoint<Voucher, VoucherResponse, BaseResponse, VoucherAssembler> {
  /**
   * Initializes the endpoint with the injected HttpClient, assembler, and environment URL.
   */
  constructor() {
    const http = inject(HttpClient);
    const assembler = inject(VoucherAssembler);
    const url = `${environment.platformProviderApiBaseUrl}${environment.platformProviderVouchersEndpointPath}`;
    super(http, url, assembler);
  }

  /**
   * Updates only the status field of an existing voucher via PATCH.
   *
   * @param id - The voucher unique identifier.
   * @param status - The new status value.
   * @param version - The current optimistic-lock version.
   * @returns An {@link Observable} emitting the updated {@link Voucher} entity.
   */
  updateStatus(id: string, status: string, version: number): Observable<Voucher> {
    return this.patch(id, { status, version } as Partial<VoucherResponse>);
  }
}

