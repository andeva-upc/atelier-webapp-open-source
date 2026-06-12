import { UpdateCustomerCommand } from '../../domain/model/commands/update-customer.command';
import { UpdateCustomerRequest } from '../requests/update-customer.request';
export class UpdateCustomerAssembler {
  toRequestFromCommand(command: UpdateCustomerCommand): UpdateCustomerRequest {
    return { ...command };
  }
}