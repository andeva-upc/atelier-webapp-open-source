import { BaseApi } from '../../../shared/infrastructure/base-api';
import { ForgotPasswordResponse } from '../responses/forgot-password-response';
import { HttpClient } from '@angular/common/http';
import { ForgotPasswordAssembler } from '../assemblers/forgot-password-assembler';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GeneratePasswordRecoveryTokenCommand } from '../../domain/model/commands/generate-password-recovery-token.command';

const forgotPasswordApiEndpointUrl = `${environment.apiBaseUrl}${environment.endpoints.iam.forgotPassword}`;

export class ForgotPasswordApiEndpoint extends BaseApi {
  constructor(private http: HttpClient, private assembler: ForgotPasswordAssembler) {
    super();
  }

  forgotPassword(command: GeneratePasswordRecoveryTokenCommand): Observable<ForgotPasswordResponse> {
    const request = this.assembler.toRequestFromCommand(command);
    return this.http.post<ForgotPasswordResponse>(forgotPasswordApiEndpointUrl, request).pipe(
      catchError(this.handleError('Failed to generate password recovery token'))
    );
  }
}
