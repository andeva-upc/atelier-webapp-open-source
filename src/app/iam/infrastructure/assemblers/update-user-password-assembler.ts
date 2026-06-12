import { UpdateUserPasswordCommand } from '../../domain/model/commands/update-user-password.command';
import { UpdateUserPasswordRequest } from '../requests/update-user-password.request';

export class UpdateUserPasswordAssembler {
  toRequestFromCommand(command: UpdateUserPasswordCommand): UpdateUserPasswordRequest {
    return {
      currentPassword: command.currentPassword,
      newPassword: command.newPassword
    };
  }
}
