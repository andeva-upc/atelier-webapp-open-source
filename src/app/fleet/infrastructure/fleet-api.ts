import { Injectable } from '@angular/core';
import { AppointmentsApiEndpoint } from './endpoints/appointments.endpoint';
import { CustomerRegistrationsApiEndpoint } from './endpoints/customer-registrations.endpoint';
import { EmployeeRegistrationsApiEndpoint } from './endpoints/employee-registrations.endpoint';
import { VehiclesApiEndpoint } from './endpoints/vehicles.endpoint';
import { CustomerVehiclesApiEndpoint } from './endpoints/customer-vehicles.endpoint';
import { Obd2DevicesApiEndpoint } from './endpoints/obd2-devices.endpoint';
import { Obd2RegistrationsApiEndpoint } from './endpoints/obd2-registrations.endpoint';

@Injectable({
  providedIn: 'root'
})
export class FleetApi {
  constructor(
    public readonly appointments: AppointmentsApiEndpoint,
    public readonly customerRegistrations: CustomerRegistrationsApiEndpoint,
    public readonly employeeRegistrations: EmployeeRegistrationsApiEndpoint,
    public readonly vehicles: VehiclesApiEndpoint,
    public readonly customerVehicles: CustomerVehiclesApiEndpoint,
    public readonly obd2Devices: Obd2DevicesApiEndpoint,
    public readonly obd2Registrations: Obd2RegistrationsApiEndpoint
  ) {}
}
