import { BaseApi } from '../../../shared/infrastructure/base-api';
import { UserResource } from '../responses/user-response';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';

const usersApiEndpointUrl = `${environment.apiBaseUrl}${environment.endpoints.iam.getByUserId}`;

export class UsersApiEndpoint extends BaseApi {
  constructor(private http: HttpClient) {
    super();
  }

  getUserById(userId: string): Observable<UserResource> {
    return this.http.get<UserResource>(`${usersApiEndpointUrl}/${userId}`).pipe(
      catchError(this.handleError('Failed to get user by ID'))
    );
  }

  getUserByEmail(email: string): Observable<UserResource> {
    return this.http.get<UserResource>(usersApiEndpointUrl, { params: { email } }).pipe(
      catchError(this.handleError('Failed to get user by email'))
    );
  }
}
