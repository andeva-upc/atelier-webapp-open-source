import { Injectable } from '@angular/core';
import { ServicesApiEndpoint } from './endpoints/services.endpoint';
import { WorkOrdersApiEndpoint } from './endpoints/work-orders.endpoint';
import { WorkOrderTasksApiEndpoint } from './endpoints/work-order-tasks.endpoint';

@Injectable({ providedIn: 'root' })
export class OperationsApi {
  constructor(
    public readonly services: ServicesApiEndpoint,
    public readonly workOrders: WorkOrdersApiEndpoint,
    public readonly workOrderTasks: WorkOrderTasksApiEndpoint
  ) {}
}