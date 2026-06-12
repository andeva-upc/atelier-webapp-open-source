import { CreateCustomerCommand } from '../../domain/model/commands/create-customer.command';
import { CreateCustomerRequest } from '../requests/create-customer.request';
export class CreateCustomerAssembler {
  toRequestFromCommand(command: CreateCustomerCommand): CreateCustomerRequest {
    return { ...command };
  }
}