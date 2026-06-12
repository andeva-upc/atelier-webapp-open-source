import { SignUpCommand } from '../../domain/model/commands/sign-up.command';
import { SignUpRequest } from '../requests/sign-up.request';

export class SignUpAssembler {
  toRequestFromCommand(command: SignUpCommand): SignUpRequest {
    return {
      email: command.email,
      password: command.password
    };
  }
}
