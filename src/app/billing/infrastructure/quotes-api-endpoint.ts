import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { BaseResponse } from '../../shared/infrastructure/base-response';
import { Quote } from '../domain/models/quote.entity';
import { QuoteResponse } from './quotes-response';
import { QuoteAssembler } from './quote-assembler';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * HTTP client for quotation API operations.
 *
 * @remarks
 * Inherits generic CRUD operations from {@link BaseApiEndpoint} and provides
 * quote-specific approval operations.
 */
@Injectable({ providedIn: 'root' })
export class QuotesApiEndpoint extends BaseApiEndpoint<Quote, QuoteResponse, BaseResponse, QuoteAssembler> {
  /**
   * Initializes the endpoint with the injected HttpClient, assembler, and environment URL.
   */
  constructor() {
    const http = inject(HttpClient);
    const assembler = inject(QuoteAssembler);
    const url = `${environment.platformProviderApiBaseUrl}${environment.platformProviderQuotesEndpointPath}`;
    super(http, url, assembler);
  }

  /**
   * Approves a quotation by setting its status to APPROVED via PATCH.
   *
   * @param id - The quotation unique identifier.
   * @param version - The current optimistic-lock version.
   * @returns An {@link Observable} emitting the approved {@link Quote} entity.
   */
  approve(id: string, version: number): Observable<Quote> {
    return this.patch(id, { status: 'APPROVED', version } as Partial<QuoteResponse>);
  }
}
