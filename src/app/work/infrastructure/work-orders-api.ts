import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { WorkOrderRepository } from '../domain/repositories/work-order.repository';
import { WorkOrdersApiEndpoint } from './work-orders-api-endpoint';
import { WorkOrder } from '../domain/models/work-order.entity';

@Injectable({ providedIn: 'root' })
export class WorkOrdersApi extends BaseApi implements WorkOrderRepository {
  private readonly workOrdersEndpoint = inject(WorkOrdersApiEndpoint);

  getAll(): Observable<WorkOrder[]> {
    return this.workOrdersEndpoint.getAll();
  }

  getById(id: string): Observable<WorkOrder> {
    return this.workOrdersEndpoint.getById(id);
  }

  create(workOrder: Partial<WorkOrder>): Observable<WorkOrder> {
    return this.workOrdersEndpoint.create(workOrder as WorkOrder);
  }

  update(id: string, workOrder: Partial<WorkOrder>): Observable<WorkOrder> {
    return this.workOrdersEndpoint.update(workOrder as WorkOrder, id);
  }
}
