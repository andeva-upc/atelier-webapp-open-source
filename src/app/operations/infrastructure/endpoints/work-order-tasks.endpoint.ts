import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

import { WorkOrderResource } from '../responses/work-order.response';
import { AddProductToTaskCommand } from '../../domain/model/commands/add-product-to-task.command';
import { UpdateProductQuantityInTaskCommand } from '../../domain/model/commands/update-product-quantity-in-task.command';

import { AddProductRequestAssembler } from '../assemblers/add-product-request.assembler';
import { UpdateProductQuantityInTaskRequestAssembler } from '../assemblers/update-product-quantity-in-task-request.assembler';

@Injectable({ providedIn: 'root' })
export class WorkOrderTasksApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.operations.workOrderTasks}`;

  constructor(private http: HttpClient) {}

  // Task Actions
  startTask(taskId: string): Observable<WorkOrderResource> {
    return this.http.post<WorkOrderResource>(`${this.baseUrl}/${taskId}/start`, {});
  }

  completeTask(taskId: string): Observable<WorkOrderResource> {
    return this.http.post<WorkOrderResource>(`${this.baseUrl}/${taskId}/complete`, {});
  }

  reopenTask(taskId: string): Observable<WorkOrderResource> {
    return this.http.post<WorkOrderResource>(`${this.baseUrl}/${taskId}/reopen`, {});
  }

  // Task Products
  addProductToTask(taskId: string, command: AddProductToTaskCommand): Observable<WorkOrderResource> {
    const request = AddProductRequestAssembler.toRequestFromCommand(command);
    return this.http.post<WorkOrderResource>(`${this.baseUrl}/${taskId}/products`, request);
  }

  updateProductQuantityInTask(taskId: string, productId: string, command: UpdateProductQuantityInTaskCommand): Observable<WorkOrderResource> {
    const request = UpdateProductQuantityInTaskRequestAssembler.toRequestFromCommand(command);
    return this.http.put<WorkOrderResource>(`${this.baseUrl}/${taskId}/products/${productId}`, request);
  }

  removeProductFromTask(taskId: string, productId: string): Observable<WorkOrderResource> {
    return this.http.delete<WorkOrderResource>(`${this.baseUrl}/${taskId}/products/${productId}`);
  }
}
