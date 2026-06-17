import { Vehicle } from '../../domain/model/vehicle.model';
import { Obd2Device, Obd2Registration, TelemetrySnapshot, DtcAlert } from '../../domain/model/obd2.model';
import { VehicleResponse } from '../responses/vehicle.response';
import { Obd2DeviceResponse, Obd2RegistrationResponse, TelemetrySnapshotResponse, DtcAlertResponse } from '../responses/obd2.response';

export class FleetAssemblers {
  static toVehicle(response: VehicleResponse): Vehicle {
    return {
      id: response.id,
      customerId: response.customerId,
      plateNumber: response.plateNumber,
      brand: response.brand,
      model: response.model,
      year: response.year,
      vin: response.vin
    };
  }

  static toVehicleArray(responses: VehicleResponse[]): Vehicle[] {
    return responses.map(FleetAssemblers.toVehicle);
  }

  static toObd2Device(response: Obd2DeviceResponse): Obd2Device {
    return {
      id: response.id,
      branchId: response.branchId,
      macAddress: response.macAddress,
      status: response.status
    };
  }

  static toObd2DeviceArray(responses: Obd2DeviceResponse[]): Obd2Device[] {
    return responses.map(FleetAssemblers.toObd2Device);
  }

  static toObd2Registration(response: Obd2RegistrationResponse): Obd2Registration {
    return {
      id: response.id,
      branchId: response.branchId,
      obd2DeviceId: response.obd2DeviceId,
      vehicleId: response.vehicleId,
      registeredAt: response.registeredAt,
      status: response.status
    };
  }

  static toObd2RegistrationArray(responses: Obd2RegistrationResponse[]): Obd2Registration[] {
    return responses.map(FleetAssemblers.toObd2Registration);
  }

  static toTelemetrySnapshot(response: TelemetrySnapshotResponse): TelemetrySnapshot {
    return {
      id: response.id,
      registrationId: response.registrationId,
      timestamp: response.timestamp,
      speed: response.speed,
      rpm: response.rpm,
      engineLoad: response.engineLoad,
      coolantTemp: response.coolantTemp
    };
  }

  static toTelemetrySnapshotArray(responses: TelemetrySnapshotResponse[]): TelemetrySnapshot[] {
    return responses.map(FleetAssemblers.toTelemetrySnapshot);
  }

  static toDtcAlert(response: DtcAlertResponse): DtcAlert {
    return {
      id: response.id,
      registrationId: response.registrationId,
      timestamp: response.timestamp,
      troubleCode: response.troubleCode,
      description: response.description,
      severity: response.severity
    };
  }

  static toDtcAlertArray(responses: DtcAlertResponse[]): DtcAlert[] {
    return responses.map(FleetAssemblers.toDtcAlert);
  }
}
