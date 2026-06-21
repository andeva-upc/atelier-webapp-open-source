import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IngestTelemetryCommand } from '../../domain/model/commands/ingest-telemetry.command';
import { IngestTelemetryRequestAssembler } from '../assemblers/ingest-telemetry-request.assembler';
import { TelemetrySnapshotResource } from '../responses/telemetry-snapshot.response';

@Injectable({ providedIn: 'root' })
export class TelemetryApiEndpoint {
  private readonly ingestUrl = `${environment.apiBaseUrl}${environment.endpoints.iot.vhTelemetryBatches}`;
  private readonly obd2DevicesUrl = `${environment.apiBaseUrl}${environment.endpoints.iot.obd2Devices}`;

  constructor(private http: HttpClient) {}

  ingest(command: IngestTelemetryCommand): Observable<any> {
    const request = IngestTelemetryRequestAssembler.toRequestFromCommand(command);
    return this.http.post<any>(this.ingestUrl, request);
  }

  // GET /api/v1/obd2-devices/{deviceId}/telemetry-snapshots/latest
  getLatest(deviceId: string): Observable<TelemetrySnapshotResource> {
    return this.http.get<TelemetrySnapshotResource>(
      `${this.obd2DevicesUrl}/${deviceId}/telemetry-snapshots/latest`
    );
  }

  // GET /api/v1/obd2-devices/{deviceId}/telemetry-snapshots
  getHistory(deviceId: string): Observable<TelemetrySnapshotResource[]> {
    return this.http.get<TelemetrySnapshotResource[]>(
      `${this.obd2DevicesUrl}/${deviceId}/telemetry-snapshots`
    );
  }
}
