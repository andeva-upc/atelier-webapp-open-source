import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

import { EmployeeRegistrationResource } from '../responses/employee-registration.response';
import { CreateEmployeeRegistrationCommand } from '../../domain/model/commands/create-employee-registration.command';
import { UpdateEmployeeRegistrationCommand } from '../../domain/model/commands/update-employee-registration.command';
import { CreateEmployeeRegistrationRequestAssembler } from '../assemblers/create-employee-registration-request.assembler';
import { UpdateEmployeeRegistrationRequestAssembler } from '../assemblers/update-employee-registration-request.assembler';

@Injectable({ providedIn: 'root' })
export class EmployeeRegistrationsApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.fleet.employeeRegistrations}`;

  constructor(private http: HttpClient) {}

  getByBranchId(branchId: string): Observable<EmployeeRegistrationResource[]> {
    return this.http.get<EmployeeRegistrationResource[]>(`${this.baseUrl}/branch/${branchId}`);
  }

  getByEmployeeId(employeeId: string): Observable<EmployeeRegistrationResource> {
    return this.http.get<EmployeeRegistrationResource>(this.baseUrl, { params: { employeeId } });
  }

  getByBranchIdAndStatus(branchId: string, status: string): Observable<EmployeeRegistrationResource[]> {
    return this.http.get<EmployeeRegistrationResource[]>(`${this.baseUrl}/branch/${branchId}/status/${status}`);
  }

  getById(registrationId: string): Observable<EmployeeRegistrationResource> {
    return this.http.get<EmployeeRegistrationResource>(`${this.baseUrl}/${registrationId}`);
  }

  create(command: CreateEmployeeRegistrationCommand): Observable<EmployeeRegistrationResource> {
    const request = CreateEmployeeRegistrationRequestAssembler.toRequestFromCommand(command);
    return this.http.post<EmployeeRegistrationResource>(this.baseUrl, request);
  }

  update(registrationId: string, command: UpdateEmployeeRegistrationCommand): Observable<EmployeeRegistrationResource> {
    const request = UpdateEmployeeRegistrationRequestAssembler.toRequestFromCommand(command);
    return this.http.put<EmployeeRegistrationResource>(`${this.baseUrl}/${registrationId}`, request);
  }

  delete(registrationId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${registrationId}`);
  }
}
