import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { CustomerRepository } from '../domain/repositories/customer.repository';
import { CustomersApiEndpoint } from './customers-api-endpoint';
import { Customer } from '../domain/models/customer.entity';

/**
 * Infrastructure service facade for Customers external API operations.
 * 
 * Acts as the infrastructure layer facade coordinating access to Customers
 * API resources through HTTP endpoints. It orchestrates interactions between
 * the application layer (entities/aggregates) and the infrastructure layer (API endpoints).
 */
@Injectable({
  providedIn: 'root',
})
export class CustomersApi extends BaseApi implements CustomerRepository {
  /**
   * Endpoint client for customer operations.
   * @private
   */
  private readonly customersEndpoint = inject(CustomersApiEndpoint);

  /**
   * Retrieves all customers from persistence through the underlying API endpoint.
   * 
   * @returns An {@link Observable} emitting a collection of {@link Customer} entities.
   */
  getAll(): Observable<Customer[]> {
    return this.customersEndpoint.getAll();
  }

  /**
   * Searches for customers matching the given query string.
   * 
   * @param query - The search text (DNI, Name, Phone, Email, etc.).
   * @returns An {@link Observable} emitting matching {@link Customer} entities.
   */
  search(query: string): Observable<Customer[]> {
    return this.customersEndpoint.search(query);
  }

  /**
   * Persists a new customer in the storage layer.
   * 
   * @param customer - The customer instance to create.
   * @returns An {@link Observable} emitting the successfully created {@link Customer} entity.
   */
  create(customer: Customer): Observable<Customer> {
    return this.customersEndpoint.create(customer);
  }

  /**
   * Searches for any pending online pre-registrations matching the document credentials or phone number.
   * 
   * @param documentType - The document type (DNI, RUC, etc.).
   * @param documentNumber - The document identification string.
   * @param phone - The customer contact phone number.
   * @returns An {@link Observable} emitting a pre-registration data object if found, or null.
   */
  findPreRegistration(
    documentType: string,
    documentNumber: string,
    phone: string
  ): Observable<any> {
    return this.customersEndpoint.findPreRegistration(documentType, documentNumber, phone);
  }

  /**
   * Performs a soft delete operation on a customer record.
   * 
   * @param id - The unique identifier of the customer.
   * @returns An {@link Observable} that completes when the operation is done.
   */
  delete(id: string | number): Observable<void> {
    return this.customersEndpoint.delete(id);
  }
}

