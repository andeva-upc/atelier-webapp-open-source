import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Obd2RegistrationResponse, TelemetrySnapshotResponse, DtcAlertResponse } from '../responses/obd2.response';
import { LinkObd2DeviceCommand } from '../../domain/model/commands/link-obd2-device.command';

@Injectable({
  providedIn: 'root'
})
export class Obd2RegistrationsApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/obd2-device-registrations`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Obd2RegistrationResponse[]>(this.baseUrl);
  }

  linkDevice(command: LinkObd2DeviceCommand) {
    return this.http.post<Obd2RegistrationResponse>(this.baseUrl, command);
  }

  deactivate(id: string) {
    return this.http.post<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  getTelemetrySnapshots(id: string) {
    return this.http.get<TelemetrySnapshotResponse[]>(`${this.baseUrl}/${id}/telemetry-snapshots`);
  }

  getDtcAlerts(id: string) {
    return this.http.get<DtcAlertResponse[]>(`${this.baseUrl}/${id}/dtc-alerts`);
  }
}
