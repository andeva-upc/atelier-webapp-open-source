import { BaseApi } from '../../../shared/infrastructure/base-api';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateCustomerCommand } from '../../domain/model/commands/create-customer.command';
import { UpdateCustomerCommand } from '../../domain/model/commands/update-customer.command';
import { CustomerResource } from '../responses/customer-response';
import { CreateCustomerAssembler } from '../assemblers/create-customer-assembler';
import { UpdateCustomerAssembler } from '../assemblers/update-customer-assembler';

const baseUrl = `${environment.apiBaseUrl}${environment.endpoints.core.customers}`;

export class CustomersApiEndpoint extends BaseApi {
  constructor(
    private http: HttpClient,
    private createAssembler: CreateCustomerAssembler,
    private updateAssembler: UpdateCustomerAssembler
  ) { super(); }

  create(command: CreateCustomerCommand): Observable<CustomerResource> {
    const request = this.createAssembler.toRequestFromCommand(command);
    return this.http.post<CustomerResource>(baseUrl, request).pipe(
      catchError(this.handleError('Failed to create customer'))
    );
  }

  update(userId: string, command: UpdateCustomerCommand): Observable<CustomerResource> {
    const request = this.updateAssembler.toRequestFromCommand(command);
    return this.http.put<CustomerResource>(`${baseUrl}/user/${userId}`, request).pipe(
      catchError(this.handleError('Failed to update customer'))
    );
  }

  getById(customerId: string): Observable<CustomerResource> {
    return this.http.get<CustomerResource>(`${baseUrl}/${customerId}`).pipe(
      catchError(this.handleError('Failed to get customer'))
    );
  }

  delete(userId: string): Observable<any> {
    return this.http.delete(`${baseUrl}/user/${userId}`).pipe(
      catchError(this.handleError('Failed to delete customer'))
    );
  }
}
