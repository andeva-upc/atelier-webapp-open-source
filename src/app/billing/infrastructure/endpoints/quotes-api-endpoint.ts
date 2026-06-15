import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateQuoteCommand, UpdateQuoteDiscountCommand, ApproveQuoteCommand, CancelQuoteCommand } from '../../domain/model/commands/quote-commands';
import { QuoteResource } from '../responses/billing-responses';
import { QuoteAssembler } from '../assemblers/billing-assemblers';

export class QuotesApiEndpoint {
  private readonly basePath = `${environment.apiBaseUrl}/quotes`;

  constructor(private http: HttpClient) {}

  createQuote(command: CreateQuoteCommand): Observable<QuoteResource> {
    const request = QuoteAssembler.toCreateQuoteRequestFromCommand(command);
    return this.http.post<QuoteResource>(this.basePath, request);
  }

  getQuoteById(id: string): Observable<QuoteResource> {
    return this.http.get<QuoteResource>(`${this.basePath}/${id}`);
  }

  getQuotesByBranchId(branchId: string): Observable<QuoteResource[]> {
    return this.http.get<QuoteResource[]>(`${this.basePath}/branch/${branchId}`);
  }

  updateQuoteDiscount(command: UpdateQuoteDiscountCommand): Observable<QuoteResource> {
    const request = QuoteAssembler.toUpdateQuoteDiscountRequestFromCommand(command);
    return this.http.put<QuoteResource>(`${this.basePath}/${command.quoteId}`, request);
  }

  approveQuote(command: ApproveQuoteCommand): Observable<QuoteResource> {
    return this.http.post<QuoteResource>(`${this.basePath}/${command.quoteId}/approve`, {});
  }

  cancelQuote(command: CancelQuoteCommand): Observable<QuoteResource> {
    return this.http.post<QuoteResource>(`${this.basePath}/${command.quoteId}/cancel`, {});
  }
}
