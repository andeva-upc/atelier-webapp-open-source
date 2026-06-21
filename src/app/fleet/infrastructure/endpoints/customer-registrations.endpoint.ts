import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

import { CustomerRegistrationResource } from '../responses/customer-registration.response';
import { CreateCustomerRegistrationCommand } from '../../domain/model/commands/create-customer-registration.command';
import { UpdateCustomerRegistrationCommand } from '../../domain/model/commands/update-customer-registration.command';
import { CreateCustomerRegistrationRequestAssembler } from '../assemblers/create-customer-registration-request.assembler';
import { UpdateCustomerRegistrationRequestAssembler } from '../assemblers/update-customer-registration-request.assembler';

@Injectable({ providedIn: 'root' })
export class CustomerRegistrationsApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.fleet.customerRegistrations}`;

  constructor(private http: HttpClient) {}

  getByBranchId(branchId: string): Observable<CustomerRegistrationResource[]> {
    return this.http.get<CustomerRegistrationResource[]>(this.baseUrl, { params: { branchId } });
  }

  getByCustomerId(customerId: string): Observable<CustomerRegistrationResource> {
    return this.http.get<CustomerRegistrationResource>(this.baseUrl, { params: { customerId } });
  }

  getByBranchIdAndStatus(branchId: string, status: string): Observable<CustomerRegistrationResource[]> {
    return this.http.get<CustomerRegistrationResource[]>(this.baseUrl, { params: { branchId, status } });
  }

  getById(registrationId: string): Observable<CustomerRegistrationResource> {
    return this.http.get<CustomerRegistrationResource>(`${this.baseUrl}/${registrationId}`);
  }

  create(command: CreateCustomerRegistrationCommand): Observable<CustomerRegistrationResource> {
    const request = CreateCustomerRegistrationRequestAssembler.toRequestFromCommand(command);
    return this.http.post<CustomerRegistrationResource>(this.baseUrl, request);
  }

  update(registrationId: string, command: UpdateCustomerRegistrationCommand): Observable<CustomerRegistrationResource> {
    const request = UpdateCustomerRegistrationRequestAssembler.toRequestFromCommand(command);
    return this.http.put<CustomerRegistrationResource>(`${this.baseUrl}/${registrationId}`, request);
  }

  delete(registrationId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${registrationId}`);
  }
}
