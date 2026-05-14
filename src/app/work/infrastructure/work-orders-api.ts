import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { WorkOrderRepository } from '../domain/repositories/work-order.repository';
import { WorkOrdersApiEndpoint } from './work-orders-api-endpoint';
import { WorkOrder, WorkOrderTask } from '../domain/models/work-order.entity';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WorkOrdersApi extends BaseApi implements WorkOrderRepository {
  private readonly workOrdersEndpoint = inject(WorkOrdersApiEndpoint);
  private readonly http = inject(HttpClient);
  private readonly tasksUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderWorkOrdersTasksEndpointPath}`;

  getAll(): Observable<WorkOrder[]> {
    return this.workOrdersEndpoint.getAll();
  }

  getTasksByWorkOrderId(workOrderId: string): Observable<WorkOrderTask[]> {
    return this.http.get<WorkOrderTask[]>(`${this.tasksUrl}?work_order_id=${workOrderId}`);
  }

  create(workOrder: Partial<WorkOrder>): Observable<WorkOrder> {
    return this.workOrdersEndpoint.create(workOrder as WorkOrder);
  }
}
