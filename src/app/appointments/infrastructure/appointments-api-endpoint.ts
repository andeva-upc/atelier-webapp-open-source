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

interface UserRaw {
  id: string;
  email: string;
  phone?: string;
  deleted_at?: string | null;
}

interface CustomerProfileRaw {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  is_corporate?: boolean;
  business_name?: string;
  deleted_at?: string | null;
}

interface VehicleRaw {
  id: string;
  user_id: string;
  vehicle_model_id: string;
  plate_number: string;
  year?: number;
  deleted_at?: string | null;
}

interface VehicleModelRaw {
  id: string;
  brand: string;
  model: string;
}

interface BranchRaw {
  id: string;
  workshop_id: string;
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
    const usersUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderUsersEndpointPath}`;
    const customerProfilesUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderCustomerProfilesEndpointPath}`;
    const vehiclesUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderVehiclesEndpointPath}`;
    const vehicleModelsUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderVehicleModelsEndpointPath}`;
    const branchesUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderBranchesEndpointPath}`;

    return forkJoin({
      appointments: this.http.get<AppointmentResponse[]>(this.endpointUrl),
      users: this.http.get<UserRaw[]>(usersUrl),
      customerProfiles: this.http.get<CustomerProfileRaw[]>(customerProfilesUrl),
      vehicles: this.http.get<VehicleRaw[]>(vehiclesUrl),
      vehicleModels: this.http.get<VehicleModelRaw[]>(vehicleModelsUrl),
      branches: this.http.get<BranchRaw[]>(branchesUrl),
    }).pipe(
      map(({ appointments, users, customerProfiles, vehicles, vehicleModels, branches }) =>
        this.enrichAppointments(
          appointments,
          users,
          customerProfiles,
          vehicles,
          vehicleModels,
          branches
        )
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
    users: UserRaw[],
    customerProfiles: CustomerProfileRaw[],
    vehicles: VehicleRaw[],
    vehicleModels: VehicleModelRaw[],
    branches: BranchRaw[]
  ): Appointment[] {
    const userById = new Map(
      users
        .filter(user => !user.deleted_at)
        .map(user => [user.id, user])
    );

    const customerProfileById = new Map(
      customerProfiles
        .filter(customer => !customer.deleted_at)
        .map(customer => [customer.id, customer])
    );

    const vehicleById = new Map(
      vehicles
        .filter(vehicle => !vehicle.deleted_at)
        .map(vehicle => [vehicle.id, vehicle])
    );

    const vehicleModelById = new Map(
      vehicleModels.map(model => [model.id, model])
    );

    const branchById = new Map(
      branches
        .filter(branch => !branch.deleted_at)
        .map(branch => [branch.id, branch])
    );

    return appointments
      .filter(appointment => !appointment.deleted_at)
      .map(appointment => {
        const customerProfile = appointment.customer_id
          ? customerProfileById.get(appointment.customer_id)
          : undefined;

        const customerUser = customerProfile?.user_id
          ? userById.get(customerProfile.user_id)
          : undefined;

        const vehicle = appointment.vehicle_id
          ? vehicleById.get(appointment.vehicle_id)
          : undefined;

        const vehicleModel = vehicle?.vehicle_model_id
          ? vehicleModelById.get(vehicle.vehicle_model_id)
          : undefined;

        const branch = branchById.get(appointment.branch_id);

        const customerName = this.resolveCustomerName(customerProfile, appointment);

        const customerPhone =
          customerUser?.phone ??
          appointment.pre_registered_phone ??
          'Sin teléfono';

        const vehicleSummary = vehicle
          ? `${vehicleModel?.brand ?? 'Marca'} ${vehicleModel?.model ?? 'Modelo'} - ${vehicle.plate_number}`
          : appointment.pre_registered_vehicle_brand_model
          ?? appointment.pre_registered_vehicle_plate
          ?? 'Vehículo por registrar';

        return new Appointment(
          appointment.id,
          appointment.workshop_id ?? branch?.workshop_id ?? '',
          appointment.branch_id,
          this.normalizeDate(appointment.appointment_date ?? appointment.created_at ?? new Date().toISOString()),
          appointment.status,
          customerName,
          customerPhone,
          vehicleSummary,
          appointment.service_type ?? this.resolveDefaultService(appointment.status),
          appointment.mechanic_name ?? 'Por asignar',
          appointment.notes ?? 'Sin observaciones registradas.',
          appointment.version,
          appointment.customer_id,
          appointment.vehicle_id,
          appointment.deleted_at ?? undefined
        );
      })
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
  }

  private resolveCustomerName(
    customerProfile: CustomerProfileRaw | undefined,
    appointment: AppointmentResponse
  ): string {
    if (!customerProfile) {
      return appointment.pre_registered_full_name ?? 'Cliente sin registrar';
    }

    if (customerProfile.is_corporate && customerProfile.business_name) {
      return customerProfile.business_name;
    }

    const fullName = `${customerProfile.first_name ?? ''} ${customerProfile.last_name ?? ''}`.trim();

    return fullName || appointment.pre_registered_full_name || 'Cliente sin registrar';
  }

  private normalizeDate(value: string): string {
    if (value.includes('T')) {
      return value;
    }

    return value.replace(' ', 'T');
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
