import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

import { WorkOrderResource } from '../responses/work-order.response';
import { CreateWorkOrderCommand } from '../../domain/model/commands/create-work-order.command';
import { UpdateWorkOrderDetailsCommand } from '../../domain/model/commands/update-work-order-details.command';
import { AddTaskToWorkOrderCommand } from '../../domain/model/commands/add-task-to-work-order.command';
import { UpdateWorkOrderTaskDetailsCommand } from '../../domain/model/commands/update-work-order-task-details.command';

import { CreateWorkOrderRequestAssembler } from '../assemblers/create-work-order-request.assembler';
import { UpdateWorkOrderDetailsRequestAssembler } from '../assemblers/update-work-order-details-request.assembler';
import { AddTaskRequestAssembler } from '../assemblers/add-task-request.assembler';
import { UpdateWorkOrderTaskDetailsRequestAssembler } from '../assemblers/update-work-order-task-details-request.assembler';

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
    const params = new HttpParams().set('branchId', branchId);
    return this.http.get<WorkOrderResource[]>(`${this.baseUrl}`, { params });
  }

  getByVehicleId(vehicleId: string): Observable<WorkOrderResource[]> {
    const params = new HttpParams().set('vehicleId', vehicleId);
    return this.http.get<WorkOrderResource[]>(`${this.baseUrl}`, { params });
  }

  // Tasks (Only nested WorkOrder level ones)
  addTask(id: string, command: AddTaskToWorkOrderCommand): Observable<WorkOrderResource> {
    const request = AddTaskRequestAssembler.toRequestFromCommand(command);
    return this.http.post<WorkOrderResource>(`${this.baseUrl}/${id}/tasks`, request);
  }

  updateTaskDetails(id: string, taskId: string, command: UpdateWorkOrderTaskDetailsCommand): Observable<WorkOrderResource> {
    const request = UpdateWorkOrderTaskDetailsRequestAssembler.toRequestFromCommand(command);
    return this.http.put<WorkOrderResource>(`${this.baseUrl}/${id}/tasks/${taskId}`, request);
  }

  removeTask(id: string, taskId: string): Observable<WorkOrderResource> {
    return this.http.delete<WorkOrderResource>(`${this.baseUrl}/${id}/tasks/${taskId}`);
  }
}