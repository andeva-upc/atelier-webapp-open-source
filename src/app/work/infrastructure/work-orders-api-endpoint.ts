import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { WorkOrder } from '../domain/models/work-order.entity';
import { WorkOrderResponse, WorkOrdersListResponse } from './work-orders-response';
import { WorkOrderAssembler } from './work-order-assembler';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WorkOrdersApiEndpoint extends BaseApiEndpoint<WorkOrder, WorkOrderResponse, WorkOrdersListResponse, WorkOrderAssembler> {
  constructor() {
    const http = inject(HttpClient);
    const assembler = inject(WorkOrderAssembler);
    const workOrdersUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderWorkOrdersEndpointPath}`;
    super(http, workOrdersUrl, assembler);
  }
}
