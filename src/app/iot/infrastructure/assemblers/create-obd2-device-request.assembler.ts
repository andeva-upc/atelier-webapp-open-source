import { CreateObd2DeviceCommand } from '../../domain/model/commands/create-obd2-device.command';
import { CreateObd2DeviceRequest } from '../requests/create-obd2-device.request';

export class CreateObd2DeviceRequestAssembler {
  static toRequestFromCommand(command: CreateObd2DeviceCommand): CreateObd2DeviceRequest {
    return {
      branchId: command.branchId,
      macAddress: command.macAddress
    };
  }
}
