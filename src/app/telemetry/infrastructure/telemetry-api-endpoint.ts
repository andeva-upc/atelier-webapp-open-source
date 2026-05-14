import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { TelemetrySnapshot } from '../domain/models/telemetry-snapshot.entity';
import { TelemetrySnapshotResource, TelemetrySnapshotsResponse } from './telemetry-response';
import { TelemetrySnapshotAssembler, ObdDeviceAssembler, DtcAlertAssembler, VehicleAssembler } from './telemetry-assembler';
import { ObdDevice } from '../domain/models/obd-device.entity';
import { ObdDeviceResource, ObdDevicesResponse } from './telemetry-response';
import { DtcAlert } from '../domain/models/dtc-alert.entity';
import { DtcAlertResource, DtcAlertsResponse } from './telemetry-response';
import { Vehicle } from '../domain/models/vehicle.entity';
import { VehicleResource, VehiclesResponse } from './telemetry-response';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VehicleEndpoint extends BaseApiEndpoint<Vehicle, VehicleResource, VehiclesResponse, VehicleAssembler> {
  constructor() {
    const http = inject(HttpClient);
    const assembler = inject(VehicleAssembler);
    const url = `${environment.platformProviderApiBaseUrl}${environment.platformProviderVehiclesEndpointPath}`;
    super(http, url, assembler);
  }
}

@Injectable({ providedIn: 'root' })
export class TelemetrySnapshotEndpoint extends BaseApiEndpoint<TelemetrySnapshot, TelemetrySnapshotResource, TelemetrySnapshotsResponse, TelemetrySnapshotAssembler> {
  constructor() {
    const http = inject(HttpClient);
    const assembler = inject(TelemetrySnapshotAssembler);
    const url = `${environment.platformProviderApiBaseUrl}${environment.platformProviderTelemetrySnapshotsEndpointPath}`;
    super(http, url, assembler);
  }
}

@Injectable({ providedIn: 'root' })
export class ObdDeviceEndpoint extends BaseApiEndpoint<ObdDevice, ObdDeviceResource, ObdDevicesResponse, ObdDeviceAssembler> {
  constructor() {
    const http = inject(HttpClient);
    const assembler = inject(ObdDeviceAssembler);
    const url = `${environment.platformProviderApiBaseUrl}${environment.platformProviderObd2DevicesEndpointPath}`;
    super(http, url, assembler);
  }
}

@Injectable({ providedIn: 'root' })
export class DtcAlertEndpoint extends BaseApiEndpoint<DtcAlert, DtcAlertResource, DtcAlertsResponse, DtcAlertAssembler> {
  constructor() {
    const http = inject(HttpClient);
    const assembler = inject(DtcAlertAssembler);
    const url = `${environment.platformProviderApiBaseUrl}${environment.platformProviderVehicleDtcAlertsEndpointPath}`;
    super(http, url, assembler);
  }
}
