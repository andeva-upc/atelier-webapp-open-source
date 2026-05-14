import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { BaseResponse } from '../../shared/infrastructure/base-response';
import { Customer } from '../domain/models/customer.entity';
import { CustomerResponse } from './customers-response';
import { CustomerAssembler } from './customer-assembler';
import { CustomerRepository } from '../domain/repositories/customer.repository';
import { environment } from '../../../environments/environment';

/**
 * Infrastructure service for customer management (Customers).
 * 
 * Implements the {@link CustomerRepository} contract from the Domain layer,
 * inheriting generic CRUD operations from {@link BaseApiEndpoint} under DDD principles.
 * 
 * Performs client-side relational aggregation in memory, merging customers with their
 * respective vehicles and appointments. This resolves native `json-server` relationship
 * limitations regarding snake_case foreign keys.
 * 
 * Dynamically resolves API endpoints using environment variables configuration.
 */
@Injectable({
  providedIn: 'root',
})
export class CustomersApiEndpoint
  extends BaseApiEndpoint<Customer, CustomerResponse, BaseResponse, CustomerAssembler>
  implements CustomerRepository
{
  /**
   * Creates an instance of `CustomersApiEndpoint`.
   * Injects native dependencies and defines the base endpoint for the Customers API using environments.
   */
  constructor() {
    const http = inject(HttpClient);
    const assembler = inject(CustomerAssembler);
    const customersUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderCustomersEndpointPath}`;
    super(http, customersUrl, assembler);
  }

  /**
   * Retrieves the complete list of customers from the database.
   * Performs parallel requests to fetch vehicles and appointments, linking them relationally
   * to each customer to dynamically compute vehicle summaries, total services, and latest visit dates.
   *
   * @returns An {@link Observable} emitting the complete list of mapped {@link Customer} entities.
   */
  override getAll(): Observable<Customer[]> {
    const rootBaseUrl = environment.platformProviderApiBaseUrl.replace('/api/v1', '');
    const vehiclesUrl = `${rootBaseUrl}${environment.platformProviderVehiclesEndpointPath}`;
    const appointmentsUrl = `${rootBaseUrl}${environment.platformProviderAppointmentsEndpointPath}`;

    return forkJoin({
      customers: this.find(),
      vehicles: this.http.get<any[]>(vehiclesUrl),
      appointments: this.http.get<any[]>(appointmentsUrl)
    }).pipe(
      map(({ customers, vehicles, appointments }) => 
        this.aggregateCustomerData(customers, vehicles, appointments)
      )
    );
  }

  /**
   * Performs a filtered search of customers based on a query term.
   * Dynamically aggregates corresponding vehicles and appointments to the matched customer records.
   *
   * @param query - The search term (DNI, Name, Email, Phone, etc.).
   * @returns An {@link Observable} emitting the filtered and aggregated list of {@link Customer} entities.
   */
  search(query: string): Observable<Customer[]> {
    const rootBaseUrl = environment.platformProviderApiBaseUrl.replace('/api/v1', '');
    const vehiclesUrl = `${rootBaseUrl}${environment.platformProviderVehiclesEndpointPath}`;
    const appointmentsUrl = `${rootBaseUrl}${environment.platformProviderAppointmentsEndpointPath}`;

    return forkJoin({
      customers: this.find({ q: query }),
      vehicles: this.http.get<any[]>(vehiclesUrl),
      appointments: this.http.get<any[]>(appointmentsUrl)
    }).pipe(
      map(({ customers, vehicles, appointments }) => 
        this.aggregateCustomerData(customers, vehicles, appointments)
      )
    );
  }

  /**
   * Relationally aggregates raw customer records with vehicles and appointments.
   * Prevents duplication between getAll() and search() queries.
   *
   * @param customers - The raw customer responses.
   * @param vehicles - The complete vehicle collection list.
   * @param appointments - The complete appointment list.
   * @returns Mapped customer domain entities.
   */
  private aggregateCustomerData(
    customers: Customer[],
    vehicles: any[],
    appointments: any[]
  ): Customer[] {
    return customers.map(customer => {
      /** Filter vehicles associated with the customer ID */
      const customerVehicles = vehicles.filter(v => v.customer_id === customer.id);
      
      let vehiclesSummary = 'Sin vehículos registrados';
      if (customerVehicles.length > 0) {
        vehiclesSummary = customerVehicles
          .map(v => `${v.brand} ${v.model} ${v.plate_number}`)
          .join(', ');
      }

      /** Filter appointments associated with the customer ID */
      const customerAppointments = appointments.filter(a => a.customer_id === customer.id);
      const servicesCount = customerAppointments.length;

      /** Find the latest appointment date */
      let lastVisitDate = 'Sin visitas registradas';
      if (customerAppointments.length > 0) {
        const sorted = [...customerAppointments].sort(
          (a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
        );
        lastVisitDate = new Date(sorted[0].appointment_date).toISOString().split('T')[0];
      }

      return new Customer(
        customer.id,
        customer.workshopId,
        customer.documentNumber,
        customer.documentType,
        customer.fullName,
        customer.email,
        customer.phone,
        servicesCount,
        vehiclesSummary,
        lastVisitDate,
        customer.version,
        customer.deletedAt
      );
    });
  }

  /**
   * Searches for any pending online pre-registrations matching the document credentials or phone number,
   * or checks if the customer is already registered in the system.
   * 
   * @param documentType - The document type (DNI, RUC, etc.).
   * @param documentNumber - The document identification string.
   * @param phone - The customer contact phone number.
   * @returns An {@link Observable} emitting check results (existing customer, pre-registered appointment, or null).
   */
  findPreRegistration(documentType: string, documentNumber: string, phone: string): Observable<any> {
    const rootBaseUrl = environment.platformProviderApiBaseUrl.replace('/api/v1', '');
    const appointmentsUrl = `${rootBaseUrl}${environment.platformProviderAppointmentsEndpointPath}`;
    
    return forkJoin({
      existingCustomers: this.find(), // Get all to filter in-memory with flexible doc/phone matches
      appointments: this.http.get<any[]>(appointmentsUrl)
    }).pipe(
      map(({ existingCustomers, appointments }) => {
        /** 1. Check existing customers */
        const matchedCustomer = existingCustomers.find(cust => {
          const docMatch = documentNumber && 
            cust.documentType === documentType && 
            cust.documentNumber === documentNumber;
            
          const phoneMatch = phone && (
            cust.phone === phone || 
            cust.phone === `+51${phone}` || 
            cust.phone.replace('+51', '').trim() === phone
          );
          
          return docMatch || phoneMatch;
        });

        if (matchedCustomer) {
          return {
            type: 'EXISTING',
            customer: matchedCustomer
          };
        }

        /** 2. Check pending online pre-registrations */
        const pending = appointments.find(appt => {
          if (appt.status !== 'PENDING_APPROVAL') {
            return false;
          }

          const docMatch = documentNumber && 
            appt.pre_registered_document_type === documentType && 
            appt.pre_registered_document_number === documentNumber;
            
          const phoneMatch = phone && (
            appt.pre_registered_phone === phone || 
            appt.pre_registered_phone === `+51${phone}` || 
            (appt.pre_registered_phone && appt.pre_registered_phone.replace('+51', '').trim() === phone)
          );
          
          return docMatch || phoneMatch;
        });

        if (pending) {
          return {
            type: 'PRE_REGISTERED',
            appointmentId: pending.id,
            fullName: pending.pre_registered_full_name,
            email: pending.pre_registered_email,
            phone: pending.pre_registered_phone,
            vehiclePlate: pending.pre_registered_vehicle_plate,
            vehicleBrandModel: pending.pre_registered_vehicle_brand_model
          };
        }

        return null;
      })
    );
  }

  /**
   * Performs a Soft Delete on a customer by setting the `deleted_at` timestamp.
   * Overrides the base physical delete to comply with business Soft Delete policies.
   *
   * @param id - The unique identifier of the customer to delete.
   * @returns An Observable that completes when the patch is successful.
   */
  override delete(id: string | number): Observable<void> {
    const softDeleteData = {
      deleted_at: new Date().toISOString()
    };
    
    return this.http.patch<any>(`${this.endpointUrl}/${id}`, softDeleteData).pipe(
      map(() => { return; }),
      catchError(this.handleError(`Failed to soft delete customer with id ${id}`))
    );
  }
}

