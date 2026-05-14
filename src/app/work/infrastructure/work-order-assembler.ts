import { Injectable } from '@angular/core';
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { WorkOrder, WorkOrderStatus } from '../domain/models/work-order.entity';
import { WorkOrderResponse, WorkOrdersListResponse } from './work-order-response';

/**
 * Bidirectional assembler and data mapper for the WorkOrder entity.
 */
@Injectable({
  providedIn: 'root',
})
export class WorkOrderAssembler implements BaseAssembler<WorkOrder, WorkOrderResponse, WorkOrdersListResponse> {
  toEntityFromResource(resource: WorkOrderResponse): WorkOrder {
    return new WorkOrder(
      resource.id,
      resource.workshop_id,
      resource.branch_id,
      resource.internal_number,
      resource.customer_id,
      resource.vehicle_id,
      resource.assigned_mechanic_id,
      resource.driver_name,
      resource.driver_phone,
      resource.current_mileage,
      resource.license_plate,
      resource.diagnosis,
      resource.status as WorkOrderStatus,
      resource.created_at,
      resource.updated_at
    );
  }

  toResourceFromEntity(entity: WorkOrder): WorkOrderResponse {
    return {
      id: entity.id,
      workshop_id: entity.workshopId,
      branch_id: entity.branchId,
      internal_number: entity.internalNumber,
      customer_id: entity.customerId,
      billing_customer_id: null,
      vehicle_id: entity.vehicleId,
      assigned_mechanic_id: entity.assignedMechanicId,
      driver_name: entity.driverName,
      driver_phone: entity.driverPhone,
      current_mileage: entity.currentMileage,
      license_plate: entity.licensePlate,
      diagnosis: entity.diagnosis,
      status: entity.status,
      version: 0,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt
    };
  }

  toEntitiesFromResponse(response: WorkOrdersListResponse): WorkOrder[] {
    const raw = response as any;
    if (Array.isArray(raw)) {
      return raw.map(res => this.toEntityFromResource(res));
    }
    if (raw && Array.isArray(raw.work_orders)) {
      return raw.work_orders.map((res: WorkOrderResponse) => this.toEntityFromResource(res));
    }
    return [];
  }
}
