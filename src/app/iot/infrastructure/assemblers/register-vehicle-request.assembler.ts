import { RegisterVehicleCommand } from '../../domain/model/commands/register-vehicle.command';
import { RegisterVehicleRequest } from '../requests/register-vehicle.request';

export class RegisterVehicleRequestAssembler {
  static toRequestFromCommand(command: RegisterVehicleCommand): RegisterVehicleRequest {
    return {
      plateNumber: command.plateNumber,
      brand: command.brand,
      model: command.model,
      year: command.year,
      vin: command.vin
    };
  }
}
