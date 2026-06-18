import { UpdateVehicleCommand } from '../../domain/model/commands/update-vehicle.command';
import { UpdateVehicleRequest } from '../requests/update-vehicle.request';

export class UpdateVehicleRequestAssembler {
  static toRequestFromCommand(command: UpdateVehicleCommand): UpdateVehicleRequest {
    return {
      plateNumber: command.plateNumber,
      brand: command.brand,
      model: command.model,
      year: command.year,
      vin: command.vin
    };
  }
}
