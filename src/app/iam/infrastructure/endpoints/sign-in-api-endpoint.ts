import { BaseApi } from '../../../shared/infrastructure/base-api';
import { SignInResponse } from '../responses/sign-in-response';
import { HttpClient } from '@angular/common/http';
import { SignInAssembler } from '../assemblers/sign-in-assembler';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SignInCommand } from '../../domain/model/commands/sign-in.command';

const signInApiEndpointUrl = `${environment.apiBaseUrl}${environment.endpoints.iam.signIn}`;

export class SignInApiEndpoint extends BaseApi {
  constructor(private http: HttpClient, private assembler: SignInAssembler) {
    super();
  }

  signIn(command: SignInCommand): Observable<SignInResponse> {
    const request = this.assembler.toRequestFromCommand(command);
    return this.http.post<SignInResponse>(signInApiEndpointUrl, request).pipe(
      catchError(this.handleError('Failed to sign in'))
    );
  }
}
