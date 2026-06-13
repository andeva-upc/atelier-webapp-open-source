import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

import { WorkOrderResource } from '../responses/work-order.response';
import { CreateWorkOrderCommand } from '../../domain/model/commands/create-work-order.command';
import { UpdateWorkOrderDetailsCommand } from '../../domain/model/commands/update-work-order-details.command';
import { AddTaskToWorkOrderCommand } from '../../domain/model/commands/add-task-to-work-order.command';
import { UpdateWorkOrderTaskDetailsCommand } from '../../domain/model/commands/update-work-order-task-details.command';
import { AddProductToTaskCommand } from '../../domain/model/commands/add-product-to-task.command';
import { UpdateProductQuantityInTaskCommand } from '../../domain/model/commands/update-product-quantity-in-task.command';

import { CreateWorkOrderRequestAssembler } from '../assemblers/create-work-order-request.assembler';
import { UpdateWorkOrderDetailsRequestAssembler } from '../assemblers/update-work-order-details-request.assembler';
import { AddTaskRequestAssembler } from '../assemblers/add-task-request.assembler';
import { UpdateWorkOrderTaskDetailsRequestAssembler } from '../assemblers/update-work-order-task-details-request.assembler';
import { AddProductRequestAssembler } from '../assemblers/add-product-request.assembler';
import { UpdateProductQuantityInTaskRequestAssembler } from '../assemblers/update-product-quantity-in-task-request.assembler';

@Injectable({ providedIn: 'root' })
export class WorkOrdersApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.operations.workOrders}`;

  constructor(private http: HttpClient) {}

  // Work Orders (Main)
  create(command: CreateWorkOrderCommand): Observable<WorkOrderResource> {
    const request = CreateWorkOrderRequestAssembler.toRequestFromCommand(command);
    return this.http.post<WorkOrderResource>(`${this.baseUrl}`, request);
  }

  updateDetails(id: string, command: UpdateWorkOrderDetailsCommand): Observable<WorkOrderResource> {
    const request = UpdateWorkOrderDetailsRequestAssembler.toRequestFromCommand(command);
    return this.http.put<WorkOrderResource>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getById(id: string): Observable<WorkOrderResource> {
    return this.http.get<WorkOrderResource>(`${this.baseUrl}/${id}`);
  }

  getByBranchId(branchId: string): Observable<WorkOrderResource[]> {
    return this.http.get<WorkOrderResource[]>(`${this.baseUrl}/branch/${branchId}`);
  }

  getByVehicleId(vehicleId: string): Observable<WorkOrderResource[]> {
    return this.http.get<WorkOrderResource[]>(`${this.baseUrl}/vehicle/${vehicleId}`);
  }

  // Tasks
  addTask(id: string, command: AddTaskToWorkOrderCommand): Observable<WorkOrderResource> {
    const request = AddTaskRequestAssembler.toRequestFromCommand(command);
    return this.http.post<WorkOrderResource>(`${this.baseUrl}/${id}/tasks`, request);
  }

  updateTaskDetails(id: string, taskId: string, command: UpdateWorkOrderTaskDetailsCommand): Observable<WorkOrderResource> {
    const request = UpdateWorkOrderTaskDetailsRequestAssembler.toRequestFromCommand(command);
    return this.http.put<WorkOrderResource>(`${this.baseUrl}/${id}/tasks/${taskId}`, request);
  }

  removeTask(id: string, taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/tasks/${taskId}`);
  }

  startTask(id: string, taskId: string): Observable<WorkOrderResource> {
    return this.http.post<WorkOrderResource>(`${this.baseUrl}/${id}/tasks/${taskId}/start`, {});
  }

  completeTask(id: string, taskId: string): Observable<WorkOrderResource> {
    return this.http.post<WorkOrderResource>(`${this.baseUrl}/${id}/tasks/${taskId}/complete`, {});
  }

  reopenTask(id: string, taskId: string): Observable<WorkOrderResource> {
    return this.http.post<WorkOrderResource>(`${this.baseUrl}/${id}/tasks/${taskId}/reopen`, {});
  }

  // Products
  addProductToTask(id: string, taskId: string, command: AddProductToTaskCommand): Observable<WorkOrderResource> {
    const request = AddProductRequestAssembler.toRequestFromCommand(command);
    return this.http.post<WorkOrderResource>(`${this.baseUrl}/${id}/tasks/${taskId}/products`, request);
  }

  updateProductQuantityInTask(id: string, taskId: string, productId: string, command: UpdateProductQuantityInTaskCommand): Observable<WorkOrderResource> {
    const request = UpdateProductQuantityInTaskRequestAssembler.toRequestFromCommand(command);
    return this.http.put<WorkOrderResource>(`${this.baseUrl}/${id}/tasks/${taskId}/products/${productId}`, request);
  }

  removeProductFromTask(id: string, taskId: string, productId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/tasks/${taskId}/products/${productId}`);
  }
}