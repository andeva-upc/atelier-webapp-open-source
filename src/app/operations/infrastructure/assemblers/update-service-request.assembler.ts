import { UpdateServiceCommand } from '../../domain/model/commands/update-service.command';
import { UpdateServiceRequest } from '../requests/update-service.request';

export class UpdateServiceRequestAssembler {
  static toRequestFromCommand(command: UpdateServiceCommand): UpdateServiceRequest {
    return {
      name: command.name,
      price: command.price
    };
  }
}