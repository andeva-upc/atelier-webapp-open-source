import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

import { AppointmentResource } from '../responses/appointment.response';
import { CreateAppointmentCommand } from '../../domain/model/commands/create-appointment.command';
import { UpdateAppointmentCommand } from '../../domain/model/commands/update-appointment.command';
import { CreateAppointmentRequestAssembler } from '../assemblers/create-appointment-request.assembler';
import { UpdateAppointmentRequestAssembler } from '../assemblers/update-appointment-request.assembler';

@Injectable({ providedIn: 'root' })
export class AppointmentsApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.fleet.appointments}`;

  constructor(private http: HttpClient) {}

  getByBranchId(branchId: string): Observable<AppointmentResource[]> {
    return this.http.get<AppointmentResource[]>(this.baseUrl, { params: { branchId } });
  }

  getByBranchIdAndStatus(branchId: string, status: string): Observable<AppointmentResource[]> {
    return this.http.get<AppointmentResource[]>(this.baseUrl, { params: { branchId, status } });
  }

  getById(appointmentId: string): Observable<AppointmentResource> {
    return this.http.get<AppointmentResource>(`${this.baseUrl}/${appointmentId}`);
  }

  getByCustomerId(customerId: string): Observable<AppointmentResource[]> {
    return this.http.get<AppointmentResource[]>(this.baseUrl, { params: { customerId } });
  }

  getByVehicleId(vehicleId: string): Observable<AppointmentResource[]> {
    return this.http.get<AppointmentResource[]>(this.baseUrl, { params: { vehicleId } });
  }

  create(command: CreateAppointmentCommand): Observable<AppointmentResource> {
    const request = CreateAppointmentRequestAssembler.toRequestFromCommand(command);
    return this.http.post<AppointmentResource>(this.baseUrl, request);
  }

  update(appointmentId: string, command: UpdateAppointmentCommand): Observable<AppointmentResource> {
    const request = UpdateAppointmentRequestAssembler.toRequestFromCommand(command);
    return this.http.put<AppointmentResource>(`${this.baseUrl}/${appointmentId}`, request);
  }

  delete(appointmentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${appointmentId}`);
  }
}
