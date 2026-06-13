import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CoreApi } from '../infrastructure/core-api';

import { WorkshopResource } from '../infrastructure/responses/workshop-response';
import { CustomerResource } from '../infrastructure/responses/customer-response';
import { OwnerResource } from '../infrastructure/responses/owner-response';
import { EmployeeResource } from '../infrastructure/responses/employee-response';
import { BranchResource } from '../infrastructure/responses/branch-response';
import { BranchSubscriptionResource } from '../infrastructure/responses/branch-subscription-response';

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

@Injectable({providedIn: 'root'})
export class CoreStore {
  // Roles
  private readonly currentRolesSignal = signal<string[]>([]);
  // Profiles
  private readonly currentCustomerSignal = signal<CustomerResource | null>(null);
  private readonly currentOwnerSignal = signal<OwnerResource | null>(null);
  private readonly currentEmployeeSignal = signal<EmployeeResource | null>(null);
  // Workshops & Branches
  private readonly ownerWorkshopsSignal = signal<WorkshopResource[]>([]);
  private readonly currentWorkshopBranchesSignal = signal<BranchResource[]>([]);

  // Exposed Readonly Signals
  readonly currentRoles = this.currentRolesSignal.asReadonly();
  readonly currentCustomer = this.currentCustomerSignal.asReadonly();
  readonly currentOwner = this.currentOwnerSignal.asReadonly();
  readonly currentEmployee = this.currentEmployeeSignal.asReadonly();
  readonly ownerWorkshops = this.ownerWorkshopsSignal.asReadonly();
  readonly currentWorkshopBranches = this.currentWorkshopBranchesSignal.asReadonly();

  constructor(private coreApi: CoreApi) {}

  // Profiles (Roles)
  loadRolesByUserId(userId: string) {
    this.coreApi.profiles.getRolesByUserId(userId).subscribe({
      next: (roles) => this.currentRolesSignal.set(roles),
      error: (err) => console.error('Failed to load roles:', err)
    });
  }

  // Customers
  createCustomer(command: CreateCustomerCommand, router: Router) {
    this.coreApi.customers.create(command).subscribe({
      next: (resource) => {
        this.currentCustomerSignal.set(resource);
        router.navigate(['/home']).then();
      },
      error: (err) => console.error('Failed to create customer:', err)
    });
  }

  loadCustomerById(customerId: string) {
    this.coreApi.customers.getById(customerId).subscribe({
      next: (resource) => this.currentCustomerSignal.set(resource),
      error: (err) => console.error('Failed to load customer:', err)
    });
  }

  updateCustomer(userId: string, command: UpdateCustomerCommand) {
    this.coreApi.customers.update(userId, command).subscribe({
      next: (resource) => this.currentCustomerSignal.set(resource),
      error: (err) => console.error('Failed to update customer:', err)
    });
  }

  // Owners
  createOwner(command: CreateOwnerCommand, router: Router) {
    this.coreApi.owners.create(command).subscribe({
      next: (resource) => {
        this.currentOwnerSignal.set(resource);
        router.navigate(['/home']).then();
      },
      error: (err) => console.error('Failed to create owner:', err)
    });
  }

  loadOwnerById(ownerId: string) {
    this.coreApi.owners.getById(ownerId).subscribe({
      next: (resource) => this.currentOwnerSignal.set(resource),
      error: (err) => console.error('Failed to load owner:', err)
    });
  }

  updateOwner(userId: string, command: UpdateOwnerCommand) {
    this.coreApi.owners.update(userId, command).subscribe({
      next: (resource) => this.currentOwnerSignal.set(resource),
      error: (err) => console.error('Failed to update owner:', err)
    });
  }

  // Employees
  createEmployee(command: CreateEmployeeCommand, router: Router) {
    this.coreApi.employees.create(command).subscribe({
      next: (resource) => {
        this.currentEmployeeSignal.set(resource);
        router.navigate(['/home']).then();
      },
      error: (err) => console.error('Failed to create employee:', err)
    });
  }

  loadEmployeeById(employeeId: string) {
    this.coreApi.employees.getById(employeeId).subscribe({
      next: (resource) => this.currentEmployeeSignal.set(resource),
      error: (err) => console.error('Failed to load employee:', err)
    });
  }

  updateEmployee(userId: string, command: UpdateEmployeeCommand) {
    this.coreApi.employees.update(userId, command).subscribe({
      next: (resource) => this.currentEmployeeSignal.set(resource),
      error: (err) => console.error('Failed to update employee:', err)
    });
  }

  // Workshops
  createWorkshop(command: CreateWorkshopCommand) {
    this.coreApi.workshops.create(command).subscribe({
      next: (resource) => {
        const currentWorkshops = this.ownerWorkshopsSignal();
        this.ownerWorkshopsSignal.set([...currentWorkshops, resource]);
      },
      error: (err) => console.error('Failed to create workshop:', err)
    });
  }

  updateWorkshop(workshopId: string, command: UpdateWorkshopCommand) {
    this.coreApi.workshops.update(workshopId, command).subscribe({
      next: (resource) => {
        const workshops = this.ownerWorkshopsSignal().map(w => w.id === resource.id ? resource : w);
        this.ownerWorkshopsSignal.set(workshops);
      },
      error: (err) => console.error('Failed to update workshop:', err)
    });
  }

  loadWorkshopsByOwnerId(ownerId: string) {
    this.coreApi.workshops.getByOwnerId(ownerId).subscribe({
      next: (resources) => this.ownerWorkshopsSignal.set(resources),
      error: (err) => console.error('Failed to load workshops:', err)
    });
  }

  // Branches
  createBranch(command: CreateBranchCommand) {
    this.coreApi.branches.create(command).subscribe({
      next: (resource) => {
        const currentBranches = this.currentWorkshopBranchesSignal();
        this.currentWorkshopBranchesSignal.set([...currentBranches, resource]);
      },
      error: (err) => console.error('Failed to create branch:', err)
    });
  }

  updateBranch(branchId: string, command: UpdateBranchCommand) {
    this.coreApi.branches.update(branchId, command).subscribe({
      next: (resource) => {
        const branches = this.currentWorkshopBranchesSignal().map(b => b.id === resource.id ? resource : b);
        this.currentWorkshopBranchesSignal.set(branches);
      },
      error: (err) => console.error('Failed to update branch:', err)
    });
  }

  loadBranchesByWorkshopId(workshopId: string) {
    this.coreApi.branches.getByWorkshopId(workshopId).subscribe({
      next: (resources) => this.currentWorkshopBranchesSignal.set(resources),
      error: (err) => console.error('Failed to load branches:', err)
    });
  }

  // Subscriptions
  assignSubscription(branchId: string, command: AssignSubscriptionCommand) {
    this.coreApi.branches.assignSubscription(branchId, command).subscribe({
      next: (resource) => {
        console.log('Subscription assigned:', resource);
      },
      error: (err) => console.error('Failed to assign subscription:', err)
    });
  }
}
