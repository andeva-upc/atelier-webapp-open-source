import { ResetPasswordCommand } from '../../domain/model/commands/reset-password.command';
import { ResetPasswordRequest } from '../requests/reset-password.request';

export class ResetPasswordAssembler {
  toRequestFromCommand(command: ResetPasswordCommand): ResetPasswordRequest {
    return {
      token: command.token,
      newPassword: command.newPassword
    };
  }
}
