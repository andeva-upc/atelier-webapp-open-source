import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CustomerRegistrationResponse } from '../responses/customer-registration.response';

@Injectable({
  providedIn: 'root'
})
export class CustomerRegistrationsApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/customer-registrations`;

  constructor(private http: HttpClient) {}

  getByBranchId(branchId: string) {
    return this.http.get<any[]>(`${this.baseUrl}/branch/${branchId}`);
  }

  getByBranchIdAndStatus(branchId: string, status: string) {
    return this.http.get<CustomerRegistrationResponse[]>(`${this.baseUrl}/branch/${branchId}/status/${status}`);
  }

  getById(registrationId: string) {
    return this.http.get<any>(`${this.baseUrl}/${registrationId}`);
  }

  create(command: any) {
    return this.http.post<any>(this.baseUrl, command);
  }

  update(registrationId: string, command: any) {
    return this.http.put<any>(`${this.baseUrl}/${registrationId}`, command);
  }

  delete(registrationId: string) {
    return this.http.delete<void>(`${this.baseUrl}/${registrationId}`);
  }
}
