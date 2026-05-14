import { Observable } from 'rxjs';
import { Quote } from '../models/quote.entity';

/**
 * Abstract domain contract for quotation persistence operations.
 *
 * @remarks
 * Decouples the application layer from the infrastructure implementation.
 * Angular's DI will resolve this token to {@link BillingApi} at runtime.
 * Method names are prefixed to avoid signature collision when the facade
 * simultaneously implements {@link VoucherRepository}.
 */
export abstract class QuoteRepository {
  /** Retrieves all quotations. */
  abstract getAllQuotes(): Observable<Quote[]>;

  /** Retrieves a single quotation by its unique identifier. */
  abstract getQuoteById(id: string): Observable<Quote>;

  /** Creates a new quotation. */
  abstract createQuote(quote: Quote): Observable<Quote>;

  /** Updates the approval status of an existing quotation. */
  abstract approve(id: string, version: number): Observable<Quote>;
}
