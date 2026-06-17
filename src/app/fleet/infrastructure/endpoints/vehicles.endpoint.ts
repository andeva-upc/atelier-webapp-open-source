import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { VehicleResponse } from '../responses/vehicle.response';
import { TelemetrySnapshotResponse, DtcAlertResponse } from '../responses/obd2.response';
import { CreateVehicleCommand } from '../../domain/model/commands/create-vehicle.command';
import { UpdateVehicleCommand } from '../../domain/model/commands/update-vehicle.command';

@Injectable({
  providedIn: 'root'
})
export class VehiclesApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/vehicles`;

  constructor(private http: HttpClient) {}

  register(command: CreateVehicleCommand) {
    return this.http.post<VehicleResponse>(this.baseUrl, command);
  }

  update(id: string, command: UpdateVehicleCommand) {
    return this.http.put<VehicleResponse>(`${this.baseUrl}/${id}`, command);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getAvailableForLinking() {
    return this.http.get<VehicleResponse[]>(`${this.baseUrl}/available-for-linking`);
  }

  getTelemetrySnapshots(vehicleId: string) {
    return this.http.get<TelemetrySnapshotResponse[]>(`${this.baseUrl}/${vehicleId}/telemetry-snapshots`);
  }

  getDtcAlerts(vehicleId: string) {
    return this.http.get<DtcAlertResponse[]>(`${this.baseUrl}/${vehicleId}/dtc-alerts`);
  }
}
