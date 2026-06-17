import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Obd2DeviceResponse } from '../responses/obd2.response';
import { CreateObd2DeviceCommand } from '../../domain/model/commands/create-obd2-device.command';
import { UpdateObd2DeviceCommand } from '../../domain/model/commands/update-obd2-device.command';

@Injectable({
  providedIn: 'root'
})
export class Obd2DevicesApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/obd2-devices`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Obd2DeviceResponse[]>(this.baseUrl);
  }

  getAvailable() {
    return this.http.get<Obd2DeviceResponse[]>(`${this.baseUrl}/available`);
  }

  getById(id: string) {
    return this.http.get<Obd2DeviceResponse>(`${this.baseUrl}/${id}`);
  }

  register(command: CreateObd2DeviceCommand) {
    return this.http.post<Obd2DeviceResponse>(this.baseUrl, command);
  }

  update(id: string, command: UpdateObd2DeviceCommand) {
    return this.http.put<Obd2DeviceResponse>(`${this.baseUrl}/${id}`, command);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
