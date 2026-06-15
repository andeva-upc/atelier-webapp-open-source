import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LinkObd2DeviceCommand } from '../../domain/model/commands/link-obd2-device.command';
import { Obd2DeviceRegistrationResponse } from '../responses/obd2-registration.response';
import { TelemetrySnapshotResponse } from '../responses/telemetry-snapshot.response';
import { DtcAlertResponse } from '../responses/dtc-alert.response';

@Injectable({ providedIn: 'root' })
export class Obd2DeviceRegistrationsApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.iot.obd2DeviceRegistrations}`;

  constructor(private http: HttpClient) {}

  linkObd2Device(command: LinkObd2DeviceCommand): Observable<Obd2DeviceRegistrationResponse> {
    return this.http.post<Obd2DeviceRegistrationResponse>(this.baseUrl, command);
  }

  deactivate(id: string): Observable<Obd2DeviceRegistrationResponse> {
    return this.http.post<Obd2DeviceRegistrationResponse>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  getByBranchIdAndStatus(branchId: string, status: string): Observable<Obd2DeviceRegistrationResponse[]> {
    return this.http.get<Obd2DeviceRegistrationResponse[]>(this.baseUrl, {
      params: { branchId, status }
    });
  }

  getTelemetrySnapshots(id: string): Observable<TelemetrySnapshotResponse[]> {
    return this.http.get<TelemetrySnapshotResponse[]>(`${this.baseUrl}/${id}/telemetry-snapshots`);
  }

  getDtcAlerts(id: string): Observable<DtcAlertResponse[]> {
    return this.http.get<DtcAlertResponse[]>(`${this.baseUrl}/${id}/dtc-alerts`);
  }
}
