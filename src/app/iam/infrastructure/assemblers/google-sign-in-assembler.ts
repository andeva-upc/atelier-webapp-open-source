import { GoogleSignInCommand } from '../../domain/model/commands/google-sign-in.command';
import { GoogleSignInRequest } from '../requests/google-sign-in.request';

export class GoogleSignInAssembler {
  toRequestFromCommand(command: GoogleSignInCommand): GoogleSignInRequest {
    return {
      idToken: command.idToken
    };
  }
}
