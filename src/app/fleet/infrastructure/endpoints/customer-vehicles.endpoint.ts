import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { VehicleResponse } from '../responses/vehicle.response';

@Injectable({
  providedIn: 'root'
})
export class CustomerVehiclesApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/customers`;

  constructor(private http: HttpClient) {}

  getByCustomerId(customerId: string) {
    return this.http.get<VehicleResponse[]>(`${this.baseUrl}/${customerId}/vehicles`);
  }
}
