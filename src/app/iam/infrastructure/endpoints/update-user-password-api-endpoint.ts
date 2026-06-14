import { BaseApi } from '../../../shared/infrastructure/base-api';
import { UpdateUserPasswordResponse } from '../responses/update-user-password-response';
import { HttpClient } from '@angular/common/http';
import { UpdateUserPasswordAssembler } from '../assemblers/update-user-password-assembler';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UpdateUserPasswordCommand } from '../../domain/model/commands/update-user-password.command';

const updateUserPasswordApiEndpointUrl = `${environment.apiBaseUrl}${environment.endpoints.iam.updateUserPassword}`;

export class UpdateUserPasswordApiEndpoint extends BaseApi {
  constructor(private http: HttpClient, private assembler: UpdateUserPasswordAssembler) {
    super();
  }

  updateUserPassword(command: UpdateUserPasswordCommand): Observable<UpdateUserPasswordResponse> {
    const request = this.assembler.toRequestFromCommand(command);
    return this.http.put<UpdateUserPasswordResponse>(`${updateUserPasswordApiEndpointUrl}/${command.userId}/password`, request).pipe(
      catchError(this.handleError('Failed to update user password'))
    );
  }
}
