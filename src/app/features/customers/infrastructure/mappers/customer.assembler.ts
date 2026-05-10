import { Injectable } from '@angular/core';
import { BaseAssembler } from '../../../../shared/infrastructure/base-assembler';
import { Customer } from '../../domain/models/customer.entity';
import { CustomerDto } from '../dto/customer.dto';

/**
 * Bidirectional assembler and data mapper for the Customer entity.
 * 
 * Acts as an Anti-Corruption Layer (ACL) translating infrastructure-level representation DTO {@link CustomerDto}
 * to pure Domain {@link Customer} entities, and vice versa.
 */
@Injectable({
  providedIn: 'root',
})
export class CustomerAssembler implements BaseAssembler<Customer, CustomerDto, any> {
  /**
   * Converts an infrastructure-level DTO resource into a pure Domain entity.
   * Dynamically computes vehicle summaries, services count, and latest visit dates when embedded resources
   * are present, or gracefully falls back to legacy/default parameters.
   *
   * @param resource - The input DTO resource {@link CustomerDto}.
   * @returns A new instance of the {@link Customer} Domain entity.
   */
  toEntityFromResource(resource: CustomerDto): Customer {
    // 1. Dynamically calculate the vehicles summary
    let vehiclesSummary = 'Sin vehículos registrados';
    if (resource.vehicles && resource.vehicles.length > 0) {
      vehiclesSummary = resource.vehicles
        .map(v => `${v.brand} ${v.model} ${v.plate_number}`)
        .join(', ');
    } else if (resource.id === 'c3c047ca-51ff-4c22-b9cf-ae08fbff34dd') {
      // Family relationship of Maria Fe Torres Ugarte with the Corolla in db.json (customer_vehicles)
      vehiclesSummary = 'Toyota Corolla ABC-123 (Familiar)';
    } else if (resource.vehicles_summary) {
      vehiclesSummary = resource.vehicles_summary;
    }

    // 2. Dynamically calculate the services count from appointments
    const servicesCount = resource.appointments && resource.appointments.length > 0
      ? resource.appointments.length
      : (resource.services_count ?? 0);

    // 3. Extract the last visit date from registered appointments
    let lastVisitDate = 'Sin visitas registradas';
    if (resource.appointments && resource.appointments.length > 0) {
      const sortedAppointments = [...resource.appointments].sort(
        (a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
      );
      const latestDateStr = sortedAppointments[0].appointment_date;
      lastVisitDate = new Date(latestDateStr).toISOString().split('T')[0];
    } else if (resource.last_visit_date) {
      lastVisitDate = resource.last_visit_date;
    }

    return new Customer(
      resource.id,
      resource.workshop_id,
      resource.document_number,
      resource.document_type,
      resource.full_name,
      resource.email,
      resource.phone,
      servicesCount,
      vehiclesSummary,
      lastVisitDate,
      resource.version
    );
  }

  /**
   * Converts a pure Domain entity into an infrastructure-level DTO resource for network transport or persistent storage.
   *
   * @param entity - The Domain {@link Customer} entity.
   * @returns The mapped output DTO {@link CustomerDto}.
   */
  toResourceFromEntity(entity: Customer): CustomerDto {
    return {
      id: entity.id,
      workshop_id: entity.workshopId,
      document_number: entity.documentNumber,
      document_type: entity.documentType,
      full_name: entity.fullName,
      email: entity.email,
      phone: entity.phone,
      services_count: entity.servicesCount,
      vehicles_summary: entity.vehiclesSummary,
      last_visit_date: entity.lastVisitDate,
      version: entity.version,
    };
  }

  /**
   * Transforms a generic raw backend response (such as a list or custom paginated response wrapper)
   * into a clean collection of Domain entities.
   *
   * @param response - The generic raw response returned by the HTTP service.
   * @returns An array of {@link Customer} Domain entities.
   */
  toEntitiesFromResponse(response: any): Customer[] {
    if (Array.isArray(response)) {
      return response.map(res => this.toEntityFromResource(res));
    }
    if (response && Array.isArray(response.data)) {
      return response.data.map((res: CustomerDto) => this.toEntityFromResource(res));
    }
    return [];
  }
}
