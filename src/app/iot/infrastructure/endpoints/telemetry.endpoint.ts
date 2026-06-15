import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IngestTelemetryCommand } from '../../domain/model/commands/ingest-telemetry.command';
import { TelemetrySnapshotResponse } from '../responses/telemetry-snapshot.response';

@Injectable({ providedIn: 'root' })
export class TelemetryApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.iot.vhTelemetryBatches}`;

  constructor(private http: HttpClient) {}

  ingest(command: IngestTelemetryCommand): Observable<any> {
    return this.http.post<any>(this.baseUrl, command);
  }

  getLatest(deviceId: string): Observable<TelemetrySnapshotResponse> {
    return this.http.get<TelemetrySnapshotResponse>(`${this.baseUrl}/latest/${deviceId}`);
  }

  getHistory(deviceId: string): Observable<TelemetrySnapshotResponse[]> {
    return this.http.get<TelemetrySnapshotResponse[]>(`${this.baseUrl}/history/${deviceId}`);
  }
}
