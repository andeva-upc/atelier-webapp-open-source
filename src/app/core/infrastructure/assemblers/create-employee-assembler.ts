import { CreateEmployeeCommand } from '../../domain/model/commands/create-employee.command';
import { CreateEmployeeRequest } from '../requests/create-employee.request';
export class CreateEmployeeAssembler {
  toRequestFromCommand(command: CreateEmployeeCommand): CreateEmployeeRequest {
    return { ...command };
  }
}