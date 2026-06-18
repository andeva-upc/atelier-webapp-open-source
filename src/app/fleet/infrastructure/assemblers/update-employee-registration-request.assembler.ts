import { UpdateEmployeeRegistrationCommand } from '../../domain/model/commands/update-employee-registration.command';
import { UpdateEmployeeRegistrationRequest } from '../requests/update-employee-registration.request';

export class UpdateEmployeeRegistrationRequestAssembler {
  static toRequestFromCommand(command: UpdateEmployeeRegistrationCommand): UpdateEmployeeRegistrationRequest {
    return {
      speciality: command.speciality,
      salary: command.salary,
      status: command.status
    };
  }
}
