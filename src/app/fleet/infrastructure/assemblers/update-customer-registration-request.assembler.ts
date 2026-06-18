import { UpdateCustomerRegistrationCommand } from '../../domain/model/commands/update-customer-registration.command';
import { UpdateCustomerRegistrationRequest } from '../requests/update-customer-registration.request';

export class UpdateCustomerRegistrationRequestAssembler {
  static toRequestFromCommand(command: UpdateCustomerRegistrationCommand): UpdateCustomerRegistrationRequest {
    return {
      status: command.status
    };
  }
}
