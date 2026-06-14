import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateObd2DeviceCommand } from '../../domain/model/commands/create-obd2-device.command';
import { UpdateObd2DeviceCommand } from '../../domain/model/commands/update-obd2-device.command';
import { Obd2DeviceResponse } from '../responses/obd2-device.response';

@Injectable({ providedIn: 'root' })
export class Obd2DevicesApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.iot.obd2Devices}`;

  constructor(private http: HttpClient) {}

  create(command: CreateObd2DeviceCommand): Observable<Obd2DeviceResponse> {
    return this.http.post<Obd2DeviceResponse>(this.baseUrl, command);
  }

  getById(id: string): Observable<Obd2DeviceResponse> {
    return this.http.get<Obd2DeviceResponse>(`${this.baseUrl}/${id}`);
  }

  update(id: string, command: UpdateObd2DeviceCommand): Observable<Obd2DeviceResponse> {
    return this.http.put<Obd2DeviceResponse>(`${this.baseUrl}/${id}`, command);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getByBranchId(branchId: string): Observable<Obd2DeviceResponse[]> {
    return this.http.get<Obd2DeviceResponse[]>(this.baseUrl, {
      params: { branchId }
    });
  }

  getAvailable(branchId: string): Observable<Obd2DeviceResponse[]> {
    return this.http.get<Obd2DeviceResponse[]>(`${this.baseUrl}/available`, {
      params: { branchId }
    });
  }
}
