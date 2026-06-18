import { UpdateObd2DeviceCommand } from '../../domain/model/commands/update-obd2-device.command';
import { UpdateObd2DeviceRequest } from '../requests/update-obd2-device.request';

export class UpdateObd2DeviceRequestAssembler {
  static toRequestFromCommand(command: UpdateObd2DeviceCommand): UpdateObd2DeviceRequest {
    return {
      macAddress: command.macAddress
    };
  }
}
