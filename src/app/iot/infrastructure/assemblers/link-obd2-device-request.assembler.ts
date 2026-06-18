import { LinkObd2DeviceCommand } from '../../domain/model/commands/link-obd2-device.command';
import { LinkObd2DeviceRequest } from '../requests/link-obd2-device.request';

export class LinkObd2DeviceRequestAssembler {
  static toRequestFromCommand(command: LinkObd2DeviceCommand): LinkObd2DeviceRequest {
    return {
      obd2DeviceId: command.obd2DeviceId,
      branchId: command.branchId,
      vehicleId: command.vehicleId
    };
  }
}
