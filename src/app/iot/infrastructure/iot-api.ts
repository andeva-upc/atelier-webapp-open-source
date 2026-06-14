import { Injectable } from '@angular/core';
import { Obd2DevicesApiEndpoint } from './endpoints/obd2-devices.endpoint';
import { Obd2DeviceRegistrationsApiEndpoint } from './endpoints/obd2-registrations.endpoint';
import { VehiclesApiEndpoint } from './endpoints/vehicles.endpoint';
import { TelemetryApiEndpoint } from './endpoints/telemetry.endpoint';

@Injectable({ providedIn: 'root' })
export class IotApi {
  constructor(
    public readonly obd2Devices: Obd2DevicesApiEndpoint,
    public readonly obd2Registrations: Obd2DeviceRegistrationsApiEndpoint,
    public readonly vehicles: VehiclesApiEndpoint,
    public readonly telemetry: TelemetryApiEndpoint
  ) {}
}
