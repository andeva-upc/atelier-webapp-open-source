import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { BaseResponse } from '../../shared/infrastructure/base-response';
import { environment } from '../../../environments/environment';
import { Appointment, AppointmentStatus } from '../domain/models/appointments.entity';
import { AppointmentRepository } from '../domain/repositories/appointments.repository';
import { AppointmentAssembler } from './appointments-assembler';
import { AppointmentResponse } from './appointments-response';

interface CustomerRaw {
  id: string;
  full_name: string;
  phone?: string;
  deleted_at?: string | null;
}

interface VehicleRaw {
  id: string;
  brand: string;
  model: string;
  plate_number: string;
  deleted_at?: string | null;
}

/**
 * HTTP endpoint for appointment operations.
 */
@Injectable({ providedIn: 'root' })
export class AppointmentsApiEndpoint
  extends BaseApiEndpoint<Appointment, AppointmentResponse, BaseResponse, AppointmentAssembler>
  implements AppointmentRepository
{
  constructor() {
    const http = inject(HttpClient);
    const assembler = inject(AppointmentAssembler);
    const url = `${environment.platformProviderApiBaseUrl}${environment.platformProviderAppointmentsEndpointPath}`;
    super(http, url, assembler);
  }

  override getAll(): Observable<Appointment[]> {
    const customersUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderCustomersEndpointPath}`;
    const vehiclesUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderVehiclesEndpointPath}`;

    return forkJoin({
      appointments: this.http.get<AppointmentResponse[]>(this.endpointUrl),
      customers: this.http.get<CustomerRaw[]>(customersUrl),
      vehicles: this.http.get<VehicleRaw[]>(vehiclesUrl),
    }).pipe(
      map(({ appointments, customers, vehicles }) =>
        this.enrichAppointments(appointments, customers, vehicles)
      )
    );
  }

  search(query: string): Observable<Appointment[]> {
    const normalizedQuery = query.trim().toLowerCase();

    return this.getAll().pipe(
      map(appointments => {
        if (!normalizedQuery) {
          return appointments;
        }

        return appointments.filter(appointment =>
          appointment.customerName.toLowerCase().includes(normalizedQuery) ||
          appointment.customerPhone.toLowerCase().includes(normalizedQuery) ||
          appointment.vehicleSummary.toLowerCase().includes(normalizedQuery) ||
          appointment.mechanicName.toLowerCase().includes(normalizedQuery) ||
          appointment.serviceType.toLowerCase().includes(normalizedQuery)
        );
      })
    );
  }

  override create(appointment: Appointment): Observable<Appointment> {
    return super.create(appointment);
  }

  override update(appointment: Appointment): Observable<Appointment> {
  return super.update(appointment, appointment.id);
  }

  updateStatus(id: string | number, status: AppointmentStatus, version: number): Observable<Appointment> {
    return this.patch(id, { status, version: version + 1 } as Partial<AppointmentResponse>);
  }

  private enrichAppointments(
    appointments: AppointmentResponse[],
    customers: CustomerRaw[],
    vehicles: VehicleRaw[]
  ): Appointment[] {
    const customerById = new Map(customers.filter(c => !c.deleted_at).map(c => [c.id, c]));
    const vehicleById = new Map(vehicles.filter(v => !v.deleted_at).map(v => [v.id, v]));

    return appointments
      .filter(appointment => !appointment.deleted_at)
      .map(appointment => {
        const customer = appointment.customer_id ? customerById.get(appointment.customer_id) : undefined;
        const vehicle = appointment.vehicle_id ? vehicleById.get(appointment.vehicle_id) : undefined;

        const customerName = customer?.full_name
          ?? appointment.pre_registered_full_name
          ?? 'Cliente sin registrar';

        const customerPhone = customer?.phone
          ?? appointment.pre_registered_phone
          ?? 'Sin teléfono';

        const vehicleSummary = vehicle
          ? `${vehicle.brand} ${vehicle.model} ${vehicle.plate_number}`
          : appointment.pre_registered_vehicle_brand_model
            ?? appointment.pre_registered_vehicle_plate
            ?? 'Vehículo por registrar';

        return new Appointment(
          appointment.id,
          appointment.workshop_id,
          appointment.branch_id,
          appointment.appointment_date ?? appointment.created_at ?? new Date().toISOString(),
          appointment.status,
          customerName,
          customerPhone,
          vehicleSummary,
          appointment.service_type ?? this.resolveDefaultService(appointment.status),
          appointment.mechanic_name ?? 'Luis P.',
          appointment.notes ?? 'Sin observaciones registradas.',
          appointment.version,
          appointment.customer_id,
          appointment.vehicle_id,
          appointment.deleted_at ?? undefined
        );
      })
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
  }

  private resolveDefaultService(status: AppointmentStatus): string {
    if (status === 'COMPLETED') {
      return 'Revisión general';
    }
    if (status === 'PENDING_APPROVAL') {
      return 'Diagnóstico';
    }
    return 'Mantenimiento preventivo';
  }
}
