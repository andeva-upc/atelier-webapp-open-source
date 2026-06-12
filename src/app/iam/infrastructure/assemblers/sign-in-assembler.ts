import { SignInCommand } from '../../domain/model/commands/sign-in.command';
import { SignInRequest } from '../requests/sign-in.request';
import { SignInResponse } from '../responses/sign-in-response';

export class SignInAssembler {
  toRequestFromCommand(command: SignInCommand): SignInRequest {
    return {
      email: command.email,
      password: command.password
    };
  }
}
