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

  /**
   * Persists a new customer in the storage layer.
   * 
   * @param customer - The customer instance to create.
   * @returns An {@link Observable} emitting the successfully created {@link Customer} entity.
   */
  abstract create(customer: Customer): Observable<Customer>;

  /**
   * Searches for any pending online pre-registrations matching the document credentials or phone number.
   * 
   * @param documentType - The document type (DNI, RUC, etc.).
   * @param documentNumber - The document identification string.
   * @param phone - The customer contact phone number.
   * @returns An {@link Observable} emitting a pre-registration data object if found, or null.
   */
  abstract findPreRegistration(documentType: string, documentNumber: string, phone: string): Observable<any>;

  /**
   * Performs a soft delete operation on a customer record.
   * 
   * @param id - The unique identifier of the customer.
   * @returns An {@link Observable} that completes when the operation is done.
   */
  abstract delete(id: string | number): Observable<void>;
}


