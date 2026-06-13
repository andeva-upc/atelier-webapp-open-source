import { BaseApi } from '../../../shared/infrastructure/base-api';
import { GoogleSignInRequest } from '../requests/google-sign-in.request';
import { GoogleSignInResponse } from '../responses/google-sign-in-response';
import { HttpClient } from '@angular/common/http';
import { GoogleSignInAssembler } from '../assemblers/google-sign-in-assembler';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment.local';
import { GoogleSignInCommand } from '../../domain/model/commands/google-sign-in.command';

const googleSignInApiEndpointUrl = `${environment.apiBaseUrl}${environment.endpoints.iam.googleSignIn}`;

export class GoogleSignInApiEndpoint extends BaseApi {
  constructor(private http: HttpClient, private assembler: GoogleSignInAssembler) {
    super();
  }

  googleSignIn(command: GoogleSignInCommand): Observable<GoogleSignInResponse> {
    const request = this.assembler.toRequestFromCommand(command);
    return this.http.post<GoogleSignInResponse>(googleSignInApiEndpointUrl, request).pipe(
      catchError(this.handleError('Failed to sign in with Google'))
    );
  }
}
