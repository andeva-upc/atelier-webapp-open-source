import { BaseApi } from '../../../shared/infrastructure/base-api';
import { SignUpResponse } from '../responses/sign-up-response';
import { HttpClient } from '@angular/common/http';
import { SignUpAssembler } from '../assemblers/sign-up-assembler';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SignUpCommand } from '../../domain/model/commands/sign-up.command';

const signUpApiEndpointUrl = `${environment.apiBaseUrl}${environment.endpoints.iam.signUp}`;

export class SignUpApiEndpoint extends BaseApi {
  constructor(private http: HttpClient, private assembler: SignUpAssembler) {
    super();
  }

  signUp(command: SignUpCommand): Observable<SignUpResponse> {
    const request = this.assembler.toRequestFromCommand(command);
    return this.http.post<SignUpResponse>(signUpApiEndpointUrl, request).pipe(
      catchError(this.handleError('Failed to sign up'))
    );
  }
}
