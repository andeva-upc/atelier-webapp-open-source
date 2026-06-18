import { Injectable } from '@angular/core';
import { AppointmentsApiEndpoint } from './endpoints/appointments.endpoint';
import { CustomerRegistrationsApiEndpoint } from './endpoints/customer-registrations.endpoint';
import { EmployeeRegistrationsApiEndpoint } from './endpoints/employee-registrations.endpoint';

@Injectable({
  providedIn: 'root'
})
export class FleetApi {
  constructor(
    public readonly appointments: AppointmentsApiEndpoint,
    public readonly customerRegistrations: CustomerRegistrationsApiEndpoint,
    public readonly employeeRegistrations: EmployeeRegistrationsApiEndpoint
  ) {}
}
