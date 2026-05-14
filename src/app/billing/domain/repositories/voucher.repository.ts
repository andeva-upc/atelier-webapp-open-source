import { Observable } from 'rxjs';
import { Voucher } from '../models/voucher.entity';

/**
 * Abstract domain contract for voucher persistence operations.
 *
 * @remarks
 * Decouples the application layer from the infrastructure implementation.
 * Angular's DI will resolve this token to {@link VouchersApi} at runtime.
 */
export abstract class VoucherRepository {
  /** Retrieves the complete list of vouchers. */
  abstract getAll(): Observable<Voucher[]>;

  /** Retrieves a single voucher by its unique identifier. */
  abstract getById(id: string): Observable<Voucher>;

  /** Persists a new voucher record. */
  abstract create(voucher: Voucher): Observable<Voucher>;

  /** Updates the status of an existing voucher. */
  abstract updateStatus(id: string, status: string, version: number): Observable<Voucher>;

  /** Registers a payment for a voucher. */
  abstract registerPayment(voucherId: string, amount: number, method: string): Observable<void>;
}
