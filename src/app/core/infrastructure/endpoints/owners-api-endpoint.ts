import { BaseApi } from '../../../shared/infrastructure/base-api';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateOwnerCommand } from '../../domain/model/commands/create-owner.command';
import { UpdateOwnerCommand } from '../../domain/model/commands/update-owner.command';
import { OwnerResource } from '../responses/owner-response';
import { CreateOwnerAssembler } from '../assemblers/create-owner-assembler';
import { UpdateOwnerAssembler } from '../assemblers/update-owner-assembler';

const baseUrl = `${environment.apiBaseUrl}${environment.endpoints.core.owners}`;

export class OwnersApiEndpoint extends BaseApi {
  constructor(
    private http: HttpClient,
    private createAssembler: CreateOwnerAssembler,
    private updateAssembler: UpdateOwnerAssembler
  ) { super(); }

  create(command: CreateOwnerCommand): Observable<OwnerResource> {
    const request = this.createAssembler.toRequestFromCommand(command);
    return this.http.post<OwnerResource>(baseUrl, request).pipe(
      catchError(this.handleError('Failed to create owner'))
    );
  }

  update(userId: string, command: UpdateOwnerCommand): Observable<OwnerResource> {
    const request = this.updateAssembler.toRequestFromCommand(command);
    return this.http.put<OwnerResource>(`${baseUrl}/user/${userId}`, request).pipe(
      catchError(this.handleError('Failed to update owner'))
    );
  }

  getById(ownerId: string): Observable<OwnerResource> {
    return this.http.get<OwnerResource>(`${baseUrl}/${ownerId}`).pipe(
      catchError(this.handleError('Failed to get owner'))
    );
  }

  delete(userId: string): Observable<any> {
    return this.http.delete(`${baseUrl}/user/${userId}`).pipe(
      catchError(this.handleError('Failed to delete owner'))
    );
  }
}
