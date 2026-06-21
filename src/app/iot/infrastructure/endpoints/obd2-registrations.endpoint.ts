import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LinkObd2DeviceCommand } from '../../domain/model/commands/link-obd2-device.command';
import { LinkObd2DeviceRequestAssembler } from '../assemblers/link-obd2-device-request.assembler';
import { Obd2DeviceRegistrationResource } from '../responses/obd2-registration.response';
import { TelemetrySnapshotResource } from '../responses/telemetry-snapshot.response';
import { DtcAlertResource } from '../responses/dtc-alert.response';

@Injectable({ providedIn: 'root' })
export class Obd2DeviceRegistrationsApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.iot.obd2DeviceRegistrations}`;

  constructor(private http: HttpClient) {}

  linkObd2Device(command: LinkObd2DeviceCommand): Observable<Obd2DeviceRegistrationResource> {
    const request = LinkObd2DeviceRequestAssembler.toRequestFromCommand(command);
    return this.http.post<Obd2DeviceRegistrationResource>(this.baseUrl, request);
  }

  deactivate(id: string): Observable<Obd2DeviceRegistrationResource> {
    return this.http.patch<Obd2DeviceRegistrationResource>(`${this.baseUrl}/${id}`, { status: 'INACTIVE' });
  }

  getByBranchIdAndStatus(branchId: string, status: string): Observable<Obd2DeviceRegistrationResource[]> {
    return this.http.get<Obd2DeviceRegistrationResource[]>(this.baseUrl, {
      params: { branchId, status }
    });
  }

  getTelemetrySnapshots(id: string): Observable<TelemetrySnapshotResource[]> {
    return this.http.get<TelemetrySnapshotResource[]>(`${this.baseUrl}/${id}/telemetry-snapshots`);
  }

  getDtcAlerts(id: string): Observable<DtcAlertResource[]> {
    return this.http.get<DtcAlertResource[]>(`${this.baseUrl}/${id}/dtc-alerts`);
  }
}
