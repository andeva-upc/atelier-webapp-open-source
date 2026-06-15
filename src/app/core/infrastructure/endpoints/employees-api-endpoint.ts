import { BaseApi } from '../../../shared/infrastructure/base-api';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateEmployeeCommand } from '../../domain/model/commands/create-employee.command';
import { UpdateEmployeeCommand } from '../../domain/model/commands/update-employee.command';
import { EmployeeResource } from '../responses/employee-response';
import { CreateEmployeeAssembler } from '../assemblers/create-employee-assembler';
import { UpdateEmployeeAssembler } from '../assemblers/update-employee-assembler';

const baseUrl = `${environment.apiBaseUrl}${environment.endpoints.core.employees}`;

export class EmployeesApiEndpoint extends BaseApi {
  constructor(
    private http: HttpClient,
    private createAssembler: CreateEmployeeAssembler,
    private updateAssembler: UpdateEmployeeAssembler
  ) { super(); }

  create(command: CreateEmployeeCommand): Observable<EmployeeResource> {
    const request = this.createAssembler.toRequestFromCommand(command);
    return this.http.post<EmployeeResource>(baseUrl, request).pipe(
      catchError(this.handleError('Failed to create employee'))
    );
  }

  update(userId: string, command: UpdateEmployeeCommand): Observable<EmployeeResource> {
    const request = this.updateAssembler.toRequestFromCommand(command);
    return this.http.put<EmployeeResource>(`${baseUrl}/user/${userId}`, request).pipe(
      catchError(this.handleError('Failed to update employee'))
    );
  }

  getById(employeeId: string): Observable<EmployeeResource> {
    return this.http.get<EmployeeResource>(`${baseUrl}/${employeeId}`).pipe(
      catchError(this.handleError('Failed to get employee'))
    );
  }

  getByUserId(userId: string): Observable<EmployeeResource> {
    return this.http.get<EmployeeResource>(`${baseUrl}/user/${userId}`).pipe(
      catchError(this.handleError('Failed to get employee by user id'))
    );
  }

  delete(userId: string): Observable<any> {
    return this.http.delete(`${baseUrl}/user/${userId}`).pipe(
      catchError(this.handleError('Failed to delete employee'))
    );
  }
}
