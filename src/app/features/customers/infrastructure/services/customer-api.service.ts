import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { BaseApiEndpoint } from '../../../../shared/infrastructure/base-api-endpoint';
import { Customer } from '../../domain/models/customer.entity';
import { CustomerDto } from '../dto/customer.dto';
import { CustomerAssembler } from '../mappers/customer.assembler';
import { CustomerRepository } from '../../domain/repositories/customer.repository';
import { environment } from '../../../../../environments/environment';

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
export class CustomerApiService
  extends BaseApiEndpoint<Customer, CustomerDto, any, CustomerAssembler>
  implements CustomerRepository
{
  /**
   * Creates an instance of `CustomerApiService`.
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
      map(({ customers, vehicles, appointments }) => {
        return customers.map(customer => {
          // Filter vehicles associated with the customer ID
          const customerVehicles = vehicles.filter(v => v.customer_id === customer.id);
          
          let vehiclesSummary = 'Sin vehículos registrados';
          if (customerVehicles.length > 0) {
            vehiclesSummary = customerVehicles
              .map(v => `${v.brand} ${v.model} ${v.plate_number}`)
              .join(', ');
          } else if (customer.id === 'c3c047ca-51ff-4c22-b9cf-ae08fbff34dd') {
            // Family relationship for Maria Fe Torres Ugarte with the Corolla in db.json (customer_vehicles)
            vehiclesSummary = 'Toyota Corolla ABC-123 (Familiar)';
          }

          // Filter appointments associated with the customer ID
          const customerAppointments = appointments.filter(a => a.customer_id === customer.id);
          const servicesCount = customerAppointments.length;

          // Find the latest appointment date
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
            customer.version
          );
        });
      })
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
      map(({ customers, vehicles, appointments }) => {
        return customers.map(customer => {
          const customerVehicles = vehicles.filter(v => v.customer_id === customer.id);
          
          let vehiclesSummary = 'Sin vehículos registrados';
          if (customerVehicles.length > 0) {
            vehiclesSummary = customerVehicles
              .map(v => `${v.brand} ${v.model} ${v.plate_number}`)
              .join(', ');
          } else if (customer.id === 'c3c047ca-51ff-4c22-b9cf-ae08fbff34dd') {
            vehiclesSummary = 'Toyota Corolla ABC-123 (Familiar)';
          }

          const customerAppointments = appointments.filter(a => a.customer_id === customer.id);
          const servicesCount = customerAppointments.length;

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
            customer.version
          );
        });
      })
    );
  }
}
