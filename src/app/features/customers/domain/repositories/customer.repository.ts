import { Observable } from 'rxjs';
import { Customer } from '../models/customer.entity';

/**
 * Domain Repository Contract defining the boundary for Customer operations.
 * 
 * decouples the presentation and domain layers from the network/database implementation.
 */
export abstract class CustomerRepository {
  /**
   * Retrieves all customers from persistence.
   * 
   * @returns An {@link Observable} emitting a collection of {@link Customer} entities.
   */
  abstract getAll(): Observable<Customer[]>;

  /**
   * Searches for customers matching the given query string.
   * 
   * @param query - The search text (DNI, Name, Phone, Email, etc.).
   * @returns An {@link Observable} emitting matching {@link Customer} entities.
   */
  abstract search(query: string): Observable<Customer[]>;
}
