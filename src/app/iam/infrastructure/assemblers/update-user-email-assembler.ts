import { UpdateUserEmailCommand } from '../../domain/model/commands/update-user-email.command';
import { UpdateUserEmailRequest } from '../requests/update-user-email.request';

export class UpdateUserEmailAssembler {
  toRequestFromCommand(command: UpdateUserEmailCommand): UpdateUserEmailRequest {
    return {
      newEmail: command.newEmail
    };
  }
}
