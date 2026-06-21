import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RegisterVehicleCommand } from '../../domain/model/commands/register-vehicle.command';
import { UpdateVehicleCommand } from '../../domain/model/commands/update-vehicle.command';
import { RegisterVehicleRequestAssembler } from '../assemblers/register-vehicle-request.assembler';
import { UpdateVehicleRequestAssembler } from '../assemblers/update-vehicle-request.assembler';
import { VehicleResource } from '../responses/vehicle.response';
import { TelemetrySnapshotResource } from '../responses/telemetry-snapshot.response';
import { DtcAlertResource } from '../responses/dtc-alert.response';
import { VehicleRegistrationResource } from '../responses/vehicle-registration.response';

@Injectable({ providedIn: 'root' })
export class VehiclesApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.iot.vehicles}`;
  private readonly customersUrl = `${environment.apiBaseUrl}${environment.endpoints.iot.customers}`;

  constructor(private http: HttpClient) {}

  getAvailableForLinking(branchId: string): Observable<VehicleResource[]> {
    return this.http.get<VehicleResource[]>(this.baseUrl, {
      params: { branchId, status: 'available-for-linking' }
    });
  }

  register(command: RegisterVehicleCommand): Observable<VehicleRegistrationResource> {
    const request = RegisterVehicleRequestAssembler.toRequestFromCommand(command);
    return this.http.post<VehicleRegistrationResource>(this.baseUrl, request);
  }

  update(id: string, command: UpdateVehicleCommand): Observable<VehicleResource> {
    const request = UpdateVehicleRequestAssembler.toRequestFromCommand(command);
    return this.http.put<VehicleResource>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getTelemetrySnapshotHistory(vehicleId: string): Observable<TelemetrySnapshotResource[]> {
    return this.http.get<TelemetrySnapshotResource[]>(`${this.baseUrl}/${vehicleId}/telemetry-snapshots`);
  }

  getDtcAlertHistory(vehicleId: string): Observable<DtcAlertResource[]> {
    return this.http.get<DtcAlertResource[]>(`${this.baseUrl}/${vehicleId}/dtc-alerts`);
  }

  getByCustomerId(customerId: string): Observable<VehicleResource[]> {
    return this.http.get<VehicleResource[]>(`${this.customersUrl}/${customerId}/vehicles`);
  }
}
