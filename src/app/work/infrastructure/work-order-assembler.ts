import { Injectable } from '@angular/core';
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { WorkOrder } from '../domain/models/work-order.entity';
import { WorkOrderResponse, WorkOrdersListResponse } from './work-orders-response';

@Injectable({ providedIn: 'root' })
export class WorkOrderAssembler implements BaseAssembler<WorkOrder, WorkOrderResponse, WorkOrdersListResponse> {
  toEntityFromResource(resource: WorkOrderResponse): WorkOrder {
    return {
      id: resource.id,
      workshopId: resource.workshop_id,
      branchId: resource.branch_id,
      internalNumber: resource.internal_number,
      customerId: resource.customer_id,
      billingCustomerId: resource.billing_customer_id,
      vehicleId: resource.vehicle_id,
      assignedMechanicId: resource.assigned_mechanic_id,
      driverName: resource.driver_name,
      driverPhone: resource.driver_phone,
      currentMileage: resource.current_mileage,
      diagnosis: resource.diagnosis,
      status: resource.status,
      version: resource.version,
      deletedAt: resource.deleted_at || undefined,
      createdAt: resource.created_at,
      updatedAt: resource.updated_at
    };
  }

  toEntitiesFromResponse(response: WorkOrdersListResponse): WorkOrder[] {
    return response.workOrders.map(wo => this.toEntityFromResource(wo));
  }

  toResourceFromEntity(entity: WorkOrder): WorkOrderResponse {
    return {
      id: entity.id,
      workshop_id: entity.workshopId,
      branch_id: entity.branchId,
      internal_number: entity.internalNumber,
      customer_id: entity.customerId,
      billing_customer_id: entity.billingCustomerId,
      vehicle_id: entity.vehicleId,
      assigned_mechanic_id: entity.assignedMechanicId,
      driver_name: entity.driverName,
      driver_phone: entity.driverPhone,
      current_mileage: entity.currentMileage,
      diagnosis: entity.diagnosis,
      status: entity.status,
      version: entity.version,
      deleted_at: entity.deletedAt ? entity.deletedAt.toString() : null,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt
    };
  }
}
