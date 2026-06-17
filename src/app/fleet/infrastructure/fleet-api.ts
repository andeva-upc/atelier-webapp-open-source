import { Injectable } from '@angular/core';
import { AppointmentsApiEndpoint } from './endpoints/appointments.endpoint';
import { CustomerRegistrationsApiEndpoint } from './endpoints/customer-registrations.endpoint';

@Injectable({
  providedIn: 'root'
})
export class FleetApi {
  constructor(
    public readonly appointments: AppointmentsApiEndpoint,
    public readonly customerRegistrations: CustomerRegistrationsApiEndpoint
  ) {}
}
