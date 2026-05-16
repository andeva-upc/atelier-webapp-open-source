import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WorkOrderTaskResponse } from './work-order-response';

@Injectable({ providedIn: 'root' })
export class WorkOrderTasksApiEndpoint {
  private readonly http = inject(HttpClient);
  
  // Use root URL without /api/v1 to match other resources in the mock backend
  private readonly url = `${environment.platformProviderApiBaseUrl.replace('/api/v1', '')}${environment.platformProviderWorkOrdersTasksEndpointPath}`;

  getAll(): Observable<WorkOrderTaskResponse[]> {
    return this.http.get<WorkOrderTaskResponse[]>(this.url);
  }
}
