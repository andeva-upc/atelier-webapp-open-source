import { BaseApi } from '../../../shared/infrastructure/base-api';
import { UpdateUserEmailResponse } from '../responses/update-user-email-response';
import { HttpClient } from '@angular/common/http';
import { UpdateUserEmailAssembler } from '../assemblers/update-user-email-assembler';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UpdateUserEmailCommand } from '../../domain/model/commands/update-user-email.command';

const updateUserEmailApiEndpointUrl = `${environment.apiBaseUrl}${environment.endpoints.iam.updateUserEmail}`;

export class UpdateUserEmailApiEndpoint extends BaseApi {
  constructor(private http: HttpClient, private assembler: UpdateUserEmailAssembler) {
    super();
  }

  updateUserEmail(command: UpdateUserEmailCommand): Observable<UpdateUserEmailResponse> {
    const request = this.assembler.toRequestFromCommand(command);
    return this.http.put<UpdateUserEmailResponse>(`${updateUserEmailApiEndpointUrl}/${command.userId}/email`, request).pipe(
      catchError(this.handleError('Failed to update user email'))
    );
  }
}
