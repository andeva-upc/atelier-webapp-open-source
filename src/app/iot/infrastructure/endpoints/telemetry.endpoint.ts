import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IngestTelemetryCommand } from '../../domain/model/commands/ingest-telemetry.command';
import { IngestTelemetryRequestAssembler } from '../assemblers/ingest-telemetry-request.assembler';
import { TelemetrySnapshotResource } from '../responses/telemetry-snapshot.response';

@Injectable({ providedIn: 'root' })
export class TelemetryApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.iot.vhTelemetryBatches}`;

  constructor(private http: HttpClient) {}

  ingest(command: IngestTelemetryCommand): Observable<any> {
    const request = IngestTelemetryRequestAssembler.toRequestFromCommand(command);
    return this.http.post<any>(this.baseUrl, request);
  }

  getLatest(deviceId: string): Observable<TelemetrySnapshotResource> {
    return this.http.get<TelemetrySnapshotResource>(`${this.baseUrl}/latest/${deviceId}`);
  }

  getHistory(deviceId: string): Observable<TelemetrySnapshotResource[]> {
    return this.http.get<TelemetrySnapshotResource[]>(`${this.baseUrl}/history/${deviceId}`);
  }
}
