import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { IotSnapshot } from '../domain/models/iot-snapshot.entity';
import { IotSnapshotResource, IotSnapshotsResponse } from './iot-response';
import { IotSnapshotAssembler, ObdDeviceAssembler, DtcAlertAssembler, VehicleAssembler } from './iot-assembler';
import { ObdDevice } from '../domain/models/obd-device.entity';
import { ObdDeviceResource, ObdDevicesResponse } from './iot-response';
import { DtcAlert } from '../domain/models/dtc-alert.entity';
import { DtcAlertResource, DtcAlertsResponse } from './iot-response';
import { Vehicle } from '../domain/models/vehicle.entity';
import { VehicleResource, VehiclesResponse } from './iot-response';
import { environment } from '../../../environments/environment';

/**
 * API Endpoint for Vehicles.
 */
@Injectable({ providedIn: 'root' })
export class VehicleEndpoint extends BaseApiEndpoint<Vehicle, VehicleResource, VehiclesResponse, VehicleAssembler> {
  constructor() {
    const http = inject(HttpClient);
    const assembler = inject(VehicleAssembler);
    const url = `${environment.platformProviderApiBaseUrl}${environment.platformProviderVehiclesEndpointPath}`;
    super(http, url, assembler);
  }
}

/**
 * API Endpoint for Iot Snapshots.
 */
@Injectable({ providedIn: 'root' })
export class IotSnapshotEndpoint extends BaseApiEndpoint<IotSnapshot, IotSnapshotResource, IotSnapshotsResponse, IotSnapshotAssembler> {
  constructor() {
    const http = inject(HttpClient);
    const assembler = inject(IotSnapshotAssembler);
    const url = `${environment.platformProviderApiBaseUrl}${environment.platformProviderIotSnapshotsEndpointPath}`;
    super(http, url, assembler);
  }
}

/**
 * API Endpoint for OBD Devices.
 */
@Injectable({ providedIn: 'root' })
export class ObdDeviceEndpoint extends BaseApiEndpoint<ObdDevice, ObdDeviceResource, ObdDevicesResponse, ObdDeviceAssembler> {
  constructor() {
    const http = inject(HttpClient);
    const assembler = inject(ObdDeviceAssembler);
    const url = `${environment.platformProviderApiBaseUrl}${environment.platformProviderObd2DevicesEndpointPath}`;
    super(http, url, assembler);
  }
}

/**
 * API Endpoint for DTC Alerts.
 */
@Injectable({ providedIn: 'root' })
export class DtcAlertEndpoint extends BaseApiEndpoint<DtcAlert, DtcAlertResource, DtcAlertsResponse, DtcAlertAssembler> {
  constructor() {
    const http = inject(HttpClient);
    const assembler = inject(DtcAlertAssembler);
    const url = `${environment.platformProviderApiBaseUrl}${environment.platformProviderVehicleDtcAlertsEndpointPath}`;
    super(http, url, assembler);
  }
}

