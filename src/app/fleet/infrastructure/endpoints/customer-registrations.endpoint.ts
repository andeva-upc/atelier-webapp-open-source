import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CustomerRegistrationResponse } from '../responses/customer-registration.response';
import { CreateCustomerRegistrationCommand } from '../../domain/model/commands/create-customer-registration.command';
import { UpdateCustomerRegistrationCommand } from '../../domain/model/commands/update-customer-registration.command';

@Injectable({
  providedIn: 'root'
})
export class CustomerRegistrationsApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/customer-registrations`;

  constructor(private http: HttpClient) {}

  getByBranchId(branchId: string) {
    return this.http.get<CustomerRegistrationResponse[]>(`${this.baseUrl}/branch/${branchId}`);
  }

  getByBranchIdAndStatus(branchId: string, status: string) {
    return this.http.get<CustomerRegistrationResponse[]>(`${this.baseUrl}/branch/${branchId}/status/${status}`);
  }

  getById(registrationId: string) {
    return this.http.get<CustomerRegistrationResponse>(`${this.baseUrl}/${registrationId}`);
  }

  create(command: CreateCustomerRegistrationCommand) {
    return this.http.post<CustomerRegistrationResponse>(this.baseUrl, command);
  }

  update(registrationId: string, command: UpdateCustomerRegistrationCommand) {
    return this.http.put<CustomerRegistrationResponse>(`${this.baseUrl}/${registrationId}`, command);
  }

  delete(registrationId: string) {
    return this.http.delete<void>(`${this.baseUrl}/${registrationId}`);
  }
}
