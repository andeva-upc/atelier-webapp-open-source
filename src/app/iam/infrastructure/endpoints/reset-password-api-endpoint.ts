import { BaseApi } from '../../../shared/infrastructure/base-api';
import { ResetPasswordResponse } from '../responses/reset-password-response';
import { HttpClient } from '@angular/common/http';
import { ResetPasswordAssembler } from '../assemblers/reset-password-assembler';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ResetPasswordCommand } from '../../domain/model/commands/reset-password.command';

const resetPasswordApiEndpointUrl = `${environment.apiBaseUrl}${environment.endpoints.iam.resetPassword}`;

export class ResetPasswordApiEndpoint extends BaseApi {
  constructor(private http: HttpClient, private assembler: ResetPasswordAssembler) {
    super();
  }

  resetPassword(command: ResetPasswordCommand): Observable<ResetPasswordResponse> {
    const request = this.assembler.toRequestFromCommand(command);
    return this.http.post<ResetPasswordResponse>(resetPasswordApiEndpointUrl, request).pipe(
      catchError(this.handleError('Failed to reset password'))
    );
  }
}
