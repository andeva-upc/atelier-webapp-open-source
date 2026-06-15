import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RegisterVehicleCommand } from '../../domain/model/commands/register-vehicle.command';
import { UpdateVehicleCommand } from '../../domain/model/commands/update-vehicle.command';
import { VehicleResponse } from '../responses/vehicle.response';
import { TelemetrySnapshotResponse } from '../responses/telemetry-snapshot.response';
import { DtcAlertResponse } from '../responses/dtc-alert.response';

@Injectable({ providedIn: 'root' })
export class VehiclesApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.iot.vehicles}`;
  private readonly customersUrl = `${environment.apiBaseUrl}${environment.endpoints.iot.customers}`;

  constructor(private http: HttpClient) {}

  getAvailableForLinking(branchId: string): Observable<VehicleResponse[]> {
    return this.http.get<VehicleResponse[]>(`${this.baseUrl}/available-for-linking`, {
      params: { branchId }
    });
  }

  register(command: RegisterVehicleCommand): Observable<VehicleResponse> {
    return this.http.post<VehicleResponse>(this.baseUrl, command);
  }

  update(id: string, command: UpdateVehicleCommand): Observable<VehicleResponse> {
    return this.http.put<VehicleResponse>(`${this.baseUrl}/${id}`, command);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getTelemetrySnapshotHistory(vehicleId: string): Observable<TelemetrySnapshotResponse[]> {
    return this.http.get<TelemetrySnapshotResponse[]>(`${this.baseUrl}/${vehicleId}/telemetry-snapshots`);
  }

  getDtcAlertHistory(vehicleId: string): Observable<DtcAlertResponse[]> {
    return this.http.get<DtcAlertResponse[]>(`${this.baseUrl}/${vehicleId}/dtc-alerts`);
  }

  getByCustomerId(customerId: string): Observable<VehicleResponse[]> {
    return this.http.get<VehicleResponse[]>(`${this.customersUrl}/${customerId}/vehicles`);
  }
}
