import { BaseApi } from '../../../shared/infrastructure/base-api';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateBranchCommand } from '../../domain/model/commands/create-branch.command';
import { UpdateBranchCommand } from '../../domain/model/commands/update-branch.command';
import { AssignSubscriptionCommand } from '../../domain/model/commands/assign-subscription.command';
import { BranchResource } from '../responses/branch-response';
import { BranchSubscriptionResource } from '../responses/branch-subscription-response';
import { CreateBranchAssembler } from '../assemblers/create-branch-assembler';
import { UpdateBranchAssembler } from '../assemblers/update-branch-assembler';
import { AssignSubscriptionAssembler } from '../assemblers/assign-subscription-assembler';

const baseUrl = `${environment.apiBaseUrl}${environment.endpoints.core.branches}`;

export class BranchesApiEndpoint extends BaseApi {
  constructor(
    private http: HttpClient,
    private createAssembler: CreateBranchAssembler,
    private updateAssembler: UpdateBranchAssembler,
    private assignAssembler: AssignSubscriptionAssembler
  ) { super(); }

  create(command: CreateBranchCommand): Observable<BranchResource> {
    const request = this.createAssembler.toRequestFromCommand(command);
    return this.http.post<BranchResource>(baseUrl, request).pipe(
      catchError(this.handleError('Failed to create branch'))
    );
  }

  update(branchId: string, command: UpdateBranchCommand): Observable<BranchResource> {
    const request = this.updateAssembler.toRequestFromCommand(command);
    return this.http.put<BranchResource>(`${baseUrl}/${branchId}`, request).pipe(
      catchError(this.handleError('Failed to update branch'))
    );
  }

  getById(branchId: string): Observable<BranchResource> {
    return this.http.get<BranchResource>(`${baseUrl}/${branchId}`).pipe(
      catchError(this.handleError('Failed to get branch'))
    );
  }

  getByWorkshopId(workshopId: string): Observable<BranchResource[]> {
    const params = new HttpParams().set('workshopId', workshopId);
    return this.http.get<BranchResource[]>(baseUrl, { params }).pipe(
      catchError(this.handleError('Failed to get branches by workshop'))
    );
  }

  assignSubscription(branchId: string, command: AssignSubscriptionCommand): Observable<BranchSubscriptionResource> {
    const request = this.assignAssembler.toRequestFromCommand(command);
    return this.http.post<BranchSubscriptionResource>(`${baseUrl}/${branchId}/subscriptions`, request).pipe(
      catchError(this.handleError('Failed to assign subscription'))
    );
  }

  cancelSubscription(branchId: string): Observable<BranchSubscriptionResource> {
    return this.http.delete<BranchSubscriptionResource>(`${baseUrl}/${branchId}/subscription`).pipe(
      catchError(this.handleError('Failed to cancel subscription'))
    );
  }
}
