import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

import { ServiceResource } from '../responses/service.response';
import { CreateServiceCommand } from '../../domain/model/commands/create-service.command';
import { UpdateServiceCommand } from '../../domain/model/commands/update-service.command';
import { CreateServiceRequestAssembler } from '../assemblers/create-service-request.assembler';
import { UpdateServiceRequestAssembler } from '../assemblers/update-service-request.assembler';

@Injectable({ providedIn: 'root' })
export class ServicesApiEndpoint {
  private readonly baseUrl = environment.operations.services;

  constructor(private http: HttpClient) {}

  create(command: CreateServiceCommand): Observable<ServiceResource> {
    const request = CreateServiceRequestAssembler.toRequestFromCommand(command);
    return this.http.post<ServiceResource>(`${this.baseUrl}`, request);
  }

  update(serviceId: string, command: UpdateServiceCommand): Observable<ServiceResource> {
    const request = UpdateServiceRequestAssembler.toRequestFromCommand(command);
    return this.http.put<ServiceResource>(`${this.baseUrl}/service/${serviceId}`, request);
  }

  delete(serviceId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/service/${serviceId}`);
  }

  getByBranchId(branchId: string): Observable<ServiceResource[]> {
    return this.http.get<ServiceResource[]>(`${this.baseUrl}/service/${branchId}`);
  }
}