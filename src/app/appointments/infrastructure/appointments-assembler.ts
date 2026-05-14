import { Injectable } from '@angular/core';
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { BaseResponse } from '../../shared/infrastructure/base-response';
import { Appointment } from '../domain/models/appointments.entity';
import { AppointmentResponse } from './appointments-response';

/**
 * Bidirectional assembler for Appointment entity and AppointmentResponse DTO.
 */
@Injectable({ providedIn: 'root' })
export class AppointmentAssembler implements BaseAssembler<Appointment, AppointmentResponse, BaseResponse> {
  toEntityFromResource(resource: AppointmentResponse): Appointment {
    const fallbackCustomerName = resource.pre_registered_full_name ?? 'Cliente sin registrar';
    const fallbackPhone = resource.pre_registered_phone ?? 'Sin teléfono';
    const fallbackVehicle = resource.pre_registered_vehicle_brand_model
      ?? resource.pre_registered_vehicle_plate
      ?? 'Vehículo por registrar';

    return new Appointment(
      resource.id,
      resource.workshop_id,
      resource.branch_id,
      resource.appointment_date ?? resource.created_at ?? new Date().toISOString(),
      resource.status,
      fallbackCustomerName,
      fallbackPhone,
      fallbackVehicle,
      resource.service_type ?? 'Servicio general',
      resource.mechanic_name ?? 'Por asignar',
      resource.notes ?? '',
      resource.version,
      resource.customer_id,
      resource.vehicle_id,
      resource.deleted_at ?? undefined
    );
  }

  toResourceFromEntity(entity: Appointment): AppointmentResponse {
    return {
      id: entity.id,
      workshop_id: entity.workshopId,
      branch_id: entity.branchId,
      customer_id: entity.customerId,
      vehicle_id: entity.vehicleId,
      appointment_date: entity.appointmentDate,
      status: entity.status,
      service_type: entity.serviceType,
      mechanic_name: entity.mechanicName,
      notes: entity.notes,
      version: entity.version,
      deleted_at: entity.deletedAt ? String(entity.deletedAt) : null,
      pre_registered_full_name: entity.customerId ? undefined : entity.customerName,
      pre_registered_phone: entity.customerId ? undefined : entity.customerPhone,
      pre_registered_vehicle_brand_model: entity.vehicleId ? undefined : entity.vehicleSummary,
    };
  }

  toEntitiesFromResponse(response: BaseResponse): Appointment[] {
    const raw = response as any;
    if (Array.isArray(raw)) {
      return raw.map(resource => this.toEntityFromResource(resource));
    }
    if (raw && Array.isArray(raw.data)) {
      return raw.data.map((resource: AppointmentResponse) => this.toEntityFromResource(resource));
    }
    return [];
  }
}
