import { Injectable } from '@angular/core';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { WorkshopsApiEndpoint } from './endpoints/workshops-api-endpoint';
import { CustomersApiEndpoint } from './endpoints/customers-api-endpoint';
import { OwnersApiEndpoint } from './endpoints/owners-api-endpoint';
import { EmployeesApiEndpoint } from './endpoints/employees-api-endpoint';
import { BranchesApiEndpoint } from './endpoints/branches-api-endpoint';
import { ProfilesApiEndpoint } from './endpoints/profiles-api-endpoint';

import { CreateWorkshopAssembler } from './assemblers/create-workshop-assembler';
import { UpdateWorkshopAssembler } from './assemblers/update-workshop-assembler';
import { CreateCustomerAssembler } from './assemblers/create-customer-assembler';
import { UpdateCustomerAssembler } from './assemblers/update-customer-assembler';
import { CreateOwnerAssembler } from './assemblers/create-owner-assembler';
import { UpdateOwnerAssembler } from './assemblers/update-owner-assembler';
import { CreateEmployeeAssembler } from './assemblers/create-employee-assembler';
import { UpdateEmployeeAssembler } from './assemblers/update-employee-assembler';
import { CreateBranchAssembler } from './assemblers/create-branch-assembler';
import { UpdateBranchAssembler } from './assemblers/update-branch-assembler';
import { AssignSubscriptionAssembler } from './assemblers/assign-subscription-assembler';

import { CreateWorkshopCommand } from '../domain/model/commands/create-workshop.command';
import { UpdateWorkshopCommand } from '../domain/model/commands/update-workshop.command';
import { CreateCustomerCommand } from '../domain/model/commands/create-customer.command';
import { UpdateCustomerCommand } from '../domain/model/commands/update-customer.command';
import { CreateOwnerCommand } from '../domain/model/commands/create-owner.command';
import { UpdateOwnerCommand } from '../domain/model/commands/update-owner.command';
import { CreateEmployeeCommand } from '../domain/model/commands/create-employee.command';
import { UpdateEmployeeCommand } from '../domain/model/commands/update-employee.command';
import { CreateBranchCommand } from '../domain/model/commands/create-branch.command';
import { UpdateBranchCommand } from '../domain/model/commands/update-branch.command';
import { AssignSubscriptionCommand } from '../domain/model/commands/assign-subscription.command';

import { WorkshopResource } from './responses/workshop-response';
import { CustomerResource } from './responses/customer-response';
import { OwnerResource } from './responses/owner-response';
import { EmployeeResource } from './responses/employee-response';
import { BranchResource } from './responses/branch-response';
import { BranchSubscriptionResource } from './responses/branch-subscription-response';

@Injectable({providedIn: 'root'})
export class CoreApi extends BaseApi {
  public workshops: WorkshopsApiEndpoint;
  public customers: CustomersApiEndpoint;
  public owners: OwnersApiEndpoint;
  public employees: EmployeesApiEndpoint;
  public branches: BranchesApiEndpoint;
  public profiles: ProfilesApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.workshops = new WorkshopsApiEndpoint(http, new CreateWorkshopAssembler(), new UpdateWorkshopAssembler());
    this.customers = new CustomersApiEndpoint(http, new CreateCustomerAssembler(), new UpdateCustomerAssembler());
    this.owners = new OwnersApiEndpoint(http, new CreateOwnerAssembler(), new UpdateOwnerAssembler());
    this.employees = new EmployeesApiEndpoint(http, new CreateEmployeeAssembler(), new UpdateEmployeeAssembler());
    this.branches = new BranchesApiEndpoint(http, new CreateBranchAssembler(), new UpdateBranchAssembler(), new AssignSubscriptionAssembler());
    this.profiles = new ProfilesApiEndpoint(http);
  }
}