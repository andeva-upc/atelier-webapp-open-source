import { BaseApi } from '../../../shared/infrastructure/base-api';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProfileResource } from '../responses/profile-response';

const baseUrl = `${environment.apiBaseUrl}${environment.endpoints.core.profiles}`;

export class ProfilesApiEndpoint extends BaseApi {
  constructor(private http: HttpClient) { super(); }

  getRolesByUserId(userId: string): Observable<string[]> {
    return this.http.get<string[]>(`${baseUrl}/users/${userId}/roles`).pipe(
      catchError(this.handleError('Failed to get profile roles'))
    );
  }

  getProfileByDocumentNumber(documentNumber: string): Observable<ProfileResource> {
    const params = new HttpParams().set('documentNumber', documentNumber);
    return this.http.get<ProfileResource>(baseUrl, { params }).pipe(
      catchError(this.handleError('Failed to get profile by document number'))
    );
  }
}
