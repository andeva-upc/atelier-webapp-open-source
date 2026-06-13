import { UpdateEmployeeCommand } from '../../domain/model/commands/update-employee.command';
import { UpdateEmployeeRequest } from '../requests/update-employee.request';
export class UpdateEmployeeAssembler {
  toRequestFromCommand(command: UpdateEmployeeCommand): UpdateEmployeeRequest {
    return { ...command };
  }
}