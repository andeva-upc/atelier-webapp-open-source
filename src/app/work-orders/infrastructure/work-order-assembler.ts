import { Injectable } from '@angular/core';
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { WorkOrder, WorkOrderStatus } from '../domain/models/work-order.entity';
import { WorkOrderResponse, WorkOrderListResponse } from './work-order-response';

@Injectable({ providedIn: 'root' })
export class WorkOrderAssembler implements BaseAssembler<WorkOrder, WorkOrderResponse, WorkOrderListResponse> {
  
  toEntityFromResource(resource: WorkOrderResponse): WorkOrder {
    return new WorkOrder(
      resource.id,
      resource.workshop_id,
      resource.internal_number,
      resource.customer_id,
      resource.vehicle_id,
      resource.assigned_mechanic_id,
      resource.driver_name,
      resource.driver_phone,
      resource.current_mileage,
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
      internal_number: entity.internalNumber,
      customer_id: entity.customerId,
      billing_customer_id: null,
      vehicle_id: entity.vehicleId,
      assigned_mechanic_id: entity.assignedMechanicId,
      driver_name: entity.driverName,
      driver_phone: entity.driverPhone,
      current_mileage: entity.currentMileage,
      diagnosis: entity.diagnosis,
      status: entity.status,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt
    };
  }

  toEntitiesFromResponse(response: WorkOrderListResponse): WorkOrder[] {
    if (!response || !response.work_orders) return [];
    return response.work_orders.map(resource => this.toEntityFromResource(resource));
  }
}
