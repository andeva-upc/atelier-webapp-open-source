import { CreateEmployeeRegistrationCommand } from '../../domain/model/commands/create-employee-registration.command';
import { CreateEmployeeRegistrationRequest } from '../requests/create-employee-registration.request';

export class CreateEmployeeRegistrationRequestAssembler {
  static toRequestFromCommand(command: CreateEmployeeRegistrationCommand): CreateEmployeeRegistrationRequest {
    return {
      employeeId: command.employeeId,
      branchId: command.branchId,
      speciality: command.speciality,
      specialityName: command.specialityName,
      salary: command.salary
    };
  }
}
