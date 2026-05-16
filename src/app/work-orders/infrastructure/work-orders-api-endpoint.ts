import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { WorkOrder } from '../domain/models/work-order.entity';
import { WorkOrderResponse, WorkOrderListResponse } from './work-order-response';
import { WorkOrderAssembler } from './work-order-assembler';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WorkOrdersApiEndpoint extends BaseApiEndpoint<WorkOrder, WorkOrderResponse, WorkOrderListResponse, WorkOrderAssembler> {
  constructor() {
    const http = inject(HttpClient);
    const assembler = inject(WorkOrderAssembler);
    const url = environment.platformProviderWorkOrdersEndpointPath.startsWith('http') 
      ? environment.platformProviderWorkOrdersEndpointPath 
      : `${environment.platformProviderApiBaseUrl}${environment.platformProviderWorkOrdersEndpointPath}`;
    super(http, url, assembler);
  }
}
