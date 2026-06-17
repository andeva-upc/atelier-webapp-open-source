import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentsApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/appointments`;

  constructor(private http: HttpClient) {}

  getByBranchId(branchId: string) {
    return this.http.get<any[]>(`${this.baseUrl}/branch/${branchId}`);
  }

  getById(appointmentId: string) {
    return this.http.get<any>(`${this.baseUrl}/${appointmentId}`);
  }

  create(command: any) {
    return this.http.post<any>(this.baseUrl, command);
  }

  update(appointmentId: string, command: any) {
    return this.http.put<any>(`${this.baseUrl}/${appointmentId}`, command);
  }

  delete(appointmentId: string) {
    return this.http.delete<void>(`${this.baseUrl}/${appointmentId}`);
  }
}
