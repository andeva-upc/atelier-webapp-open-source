import { GeneratePasswordRecoveryTokenCommand } from '../../domain/model/commands/generate-password-recovery-token.command';
import { ForgotPasswordRequest } from '../requests/forgot-password.request';

export class ForgotPasswordAssembler {
  toRequestFromCommand(command: GeneratePasswordRecoveryTokenCommand): ForgotPasswordRequest {
    return {
      email: command.email
    };
  }
}
