import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateObd2DeviceCommand } from '../../domain/model/commands/create-obd2-device.command';
import { UpdateObd2DeviceCommand } from '../../domain/model/commands/update-obd2-device.command';
import { CreateObd2DeviceRequestAssembler } from '../assemblers/create-obd2-device-request.assembler';
import { UpdateObd2DeviceRequestAssembler } from '../assemblers/update-obd2-device-request.assembler';
import { Obd2DeviceResource } from '../responses/obd2-device.response';

@Injectable({ providedIn: 'root' })
export class Obd2DevicesApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.iot.obd2Devices}`;

  constructor(private http: HttpClient) {}

  create(command: CreateObd2DeviceCommand): Observable<Obd2DeviceResource> {
    const request = CreateObd2DeviceRequestAssembler.toRequestFromCommand(command);
    return this.http.post<Obd2DeviceResource>(this.baseUrl, request);
  }

  getById(id: string): Observable<Obd2DeviceResource> {
    return this.http.get<Obd2DeviceResource>(`${this.baseUrl}/${id}`);
  }

  update(id: string, command: UpdateObd2DeviceCommand): Observable<Obd2DeviceResource> {
    const request = UpdateObd2DeviceRequestAssembler.toRequestFromCommand(command);
    return this.http.put<Obd2DeviceResource>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getByBranchId(branchId: string): Observable<Obd2DeviceResource[]> {
    return this.http.get<Obd2DeviceResource[]>(this.baseUrl, {
      params: { branchId }
    });
  }

  getAvailable(branchId: string): Observable<Obd2DeviceResource[]> {
    return this.http.get<Obd2DeviceResource[]>(`${this.baseUrl}/available`, {
      params: { branchId }
    });
  }
}
