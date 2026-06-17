import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AppointmentResponse } from '../responses/appointment.response';
import { CreateAppointmentCommand } from '../../domain/model/commands/create-appointment.command';
import { UpdateAppointmentCommand } from '../../domain/model/commands/update-appointment.command';

@Injectable({
  providedIn: 'root'
})
export class AppointmentsApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/appointments`;

  constructor(private http: HttpClient) {}

  getByBranchId(branchId: string) {
    return this.http.get<AppointmentResponse[]>(`${this.baseUrl}/branch/${branchId}`);
  }

  getById(appointmentId: string) {
    return this.http.get<AppointmentResponse>(`${this.baseUrl}/${appointmentId}`);
  }

  getByVehicleId(vehicleId: string) {
    return this.http.get<AppointmentResponse[]>(`${this.baseUrl}/vehicle/${vehicleId}`);
  }

  create(command: CreateAppointmentCommand) {
    return this.http.post<AppointmentResponse>(this.baseUrl, command);
  }

  update(appointmentId: string, command: UpdateAppointmentCommand) {
    return this.http.put<AppointmentResponse>(`${this.baseUrl}/${appointmentId}`, command);
  }

  delete(appointmentId: string) {
    return this.http.delete<void>(`${this.baseUrl}/${appointmentId}`);
  }
}
