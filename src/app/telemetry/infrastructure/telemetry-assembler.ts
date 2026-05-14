import { Injectable } from '@angular/core';
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { TelemetrySnapshot } from '../domain/models/telemetry-snapshot.entity';
import { TelemetrySnapshotResource, TelemetrySnapshotsResponse } from './telemetry-response';
import { ObdDevice } from '../domain/models/obd-device.entity';
import { ObdDeviceResource, ObdDevicesResponse } from './telemetry-response';
import { DtcAlert } from '../domain/models/dtc-alert.entity';
import { DtcAlertResource, DtcAlertsResponse } from './telemetry-response';
import { Vehicle } from '../domain/models/vehicle.entity';
import { VehicleResource, VehiclesResponse } from './telemetry-response';

@Injectable({ providedIn: 'root' })
export class VehicleAssembler implements BaseAssembler<Vehicle, VehicleResource, VehiclesResponse> {
  toEntityFromResource(resource: VehicleResource): Vehicle {
    return new Vehicle(
      resource.id,
      resource.workshop_id,
      resource.customer_id,
      resource.plate_number,
      resource.brand,
      resource.model,
      resource.year,
      resource.current_mileage,
      resource.deleted_at || undefined
    );
  }

  toResourceFromEntity(entity: Vehicle): VehicleResource {
    return {
      id: entity.id,
      workshop_id: entity.workshopId,
      customer_id: entity.customerId,
      plate_number: entity.plateNumber,
      brand: entity.brand,
      model: entity.model,
      year: entity.year,
      current_mileage: entity.currentMileage,
      deleted_at: entity.deletedAt?.toString() || null
    };
  }

  toEntitiesFromResponse(response: VehiclesResponse): Vehicle[] {
    return response.vehicles.map(r => this.toEntityFromResource(r));
  }
}

@Injectable({ providedIn: 'root' })
export class TelemetrySnapshotAssembler implements BaseAssembler<TelemetrySnapshot, TelemetrySnapshotResource, TelemetrySnapshotsResponse> {
  toEntityFromResource(resource: TelemetrySnapshotResource): TelemetrySnapshot {
    return new TelemetrySnapshot(
      resource.id.toString(),
      resource.device_id,
      resource.timestamp,
      resource.rpm,
      resource.speed_kmh,
      resource.odometer_km,
      resource.fuel_level_percent,
      resource.temp,
      resource.workshop_id,
      resource.deleted_at || undefined
    );
  }

  toResourceFromEntity(entity: TelemetrySnapshot): TelemetrySnapshotResource {
    return {
      id: Number(entity.id),
      device_id: entity.deviceId,
      timestamp: entity.timestamp.toString(),
      rpm: entity.rpm,
      speed_kmh: entity.speedKmh,
      odometer_km: entity.odometerKm,
      fuel_level_percent: entity.fuelLevelPercent,
      temp: entity.temp,
      workshop_id: entity.workshopId,
      deleted_at: entity.deletedAt?.toString() || null
    };
  }

  toEntitiesFromResponse(response: TelemetrySnapshotsResponse): TelemetrySnapshot[] {
    return response.snapshots.map(r => this.toEntityFromResource(r));
  }
}

@Injectable({ providedIn: 'root' })
export class ObdDeviceAssembler implements BaseAssembler<ObdDevice, ObdDeviceResource, ObdDevicesResponse> {
  toEntityFromResource(resource: ObdDeviceResource): ObdDevice {
    return new ObdDevice(
      resource.id,
      resource.mac_address,
      resource.vehicle_id,
      resource.status,
      resource.workshop_id,
      resource.deleted_at || undefined
    );
  }

  toResourceFromEntity(entity: ObdDevice): ObdDeviceResource {
    return {
      id: entity.id,
      mac_address: entity.macAddress,
      vehicle_id: entity.vehicleId,
      status: entity.status,
      workshop_id: entity.workshopId,
      deleted_at: entity.deletedAt?.toString() || null
    };
  }

  toEntitiesFromResponse(response: ObdDevicesResponse): ObdDevice[] {
    return response.devices.map(r => this.toEntityFromResource(r));
  }
}

@Injectable({ providedIn: 'root' })
export class DtcAlertAssembler implements BaseAssembler<DtcAlert, DtcAlertResource, DtcAlertsResponse> {
  toEntityFromResource(resource: DtcAlertResource): DtcAlert {
    return new DtcAlert(
      resource.id,
      resource.vehicle_id,
      resource.dtc_code,
      resource.severity,
      resource.description,
      resource.is_active,
      resource.workshop_id,
      resource.deleted_at || undefined
    );
  }

  toResourceFromEntity(entity: DtcAlert): DtcAlertResource {
    return {
      id: entity.id,
      vehicle_id: entity.vehicleId,
      dtc_code: entity.dtcCode,
      severity: entity.severity,
      description: entity.description,
      is_active: entity.isActive,
      workshop_id: entity.workshopId,
      deleted_at: entity.deletedAt?.toString() || null
    };
  }

  toEntitiesFromResponse(response: DtcAlertsResponse): DtcAlert[] {
    return response.alerts.map(r => this.toEntityFromResource(r));
  }
}
