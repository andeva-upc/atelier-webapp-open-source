import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { EmployeeRegistrationResponse } from '../responses/employee-registration.response';

@Injectable({
  providedIn: 'root'
})
export class EmployeeRegistrationsApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/employee-registrations`;

  constructor(private http: HttpClient) {}

  getByBranchId(branchId: string) {
    return this.http.get<EmployeeRegistrationResponse[]>(`${this.baseUrl}/branch/${branchId}`);
  }

  getByBranchIdAndStatus(branchId: string, status: string) {
    return this.http.get<EmployeeRegistrationResponse[]>(`${this.baseUrl}/branch/${branchId}/status/${status}`);
  }

  getById(registrationId: string) {
    return this.http.get<EmployeeRegistrationResponse>(`${this.baseUrl}/${registrationId}`);
  }

  create(command: any) {
    return this.http.post<EmployeeRegistrationResponse>(this.baseUrl, command);
  }

  update(registrationId: string, command: any) {
    return this.http.put<EmployeeRegistrationResponse>(`${this.baseUrl}/${registrationId}`, command);
  }

  delete(registrationId: string) {
    return this.http.delete<void>(`${this.baseUrl}/${registrationId}`);
  }
}
