import { BaseApi } from '../../../shared/infrastructure/base-api';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment.local';
import { CreateWorkshopCommand } from '../../domain/model/commands/create-workshop.command';
import { UpdateWorkshopCommand } from '../../domain/model/commands/update-workshop.command';
import { WorkshopResource } from '../responses/workshop-response';
import { CreateWorkshopAssembler } from '../assemblers/create-workshop-assembler';
import { UpdateWorkshopAssembler } from '../assemblers/update-workshop-assembler';

const baseUrl = `${environment.apiBaseUrl}${environment.endpoints.core.workshops}`;

export class WorkshopsApiEndpoint extends BaseApi {
  constructor(
    private http: HttpClient, 
    private createAssembler: CreateWorkshopAssembler,
    private updateAssembler: UpdateWorkshopAssembler
  ) { super(); }

  create(command: CreateWorkshopCommand): Observable<WorkshopResource> {
    const request = this.createAssembler.toRequestFromCommand(command);
    return this.http.post<WorkshopResource>(baseUrl, request).pipe(
      catchError(this.handleError('Failed to create workshop'))
    );
  }

  update(workshopId: string, command: UpdateWorkshopCommand): Observable<WorkshopResource> {
    const request = this.updateAssembler.toRequestFromCommand(command);
    return this.http.put<WorkshopResource>(`${baseUrl}/${workshopId}`, request).pipe(
      catchError(this.handleError('Failed to update workshop'))
    );
  }

  getById(workshopId: string): Observable<WorkshopResource> {
    return this.http.get<WorkshopResource>(`${baseUrl}/${workshopId}`).pipe(
      catchError(this.handleError('Failed to get workshop'))
    );
  }

  getByOwnerId(ownerId: string): Observable<WorkshopResource[]> {
    return this.http.get<WorkshopResource[]>(`${baseUrl}/owner/${ownerId}`).pipe(
      catchError(this.handleError('Failed to get workshops by owner'))
    );
  }
}