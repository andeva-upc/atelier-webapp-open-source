import { CreateServiceCommand } from '../../domain/model/commands/create-service.command';
import { CreateServiceRequest } from '../requests/create-service.request';

export class CreateServiceRequestAssembler {
  static toRequestFromCommand(command: CreateServiceCommand): CreateServiceRequest {
    return {
      branchId: command.branchId,
      name: command.name,
      price: command.price
    };
  }
}