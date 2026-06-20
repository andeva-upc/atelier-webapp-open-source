import { CreateCustomerRegistrationCommand } from '../../domain/model/commands/create-customer-registration.command';
import { CreateCustomerRegistrationRequest } from '../requests/create-customer-registration.request';

export class CreateCustomerRegistrationRequestAssembler {
  static toRequestFromCommand(command: CreateCustomerRegistrationCommand): CreateCustomerRegistrationRequest {
    return {
      customerId: command.customerId,
      branchId: command.branchId
    };
  }
}
