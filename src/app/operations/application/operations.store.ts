import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { OperationsApi } from '../infrastructure/operations-api';

import { ServiceResource } from '../infrastructure/responses/service.response';
import { WorkOrderResource } from '../infrastructure/responses/work-order.response';

// Service Commands
import { CreateServiceCommand } from '../domain/model/commands/create-service.command';
import { UpdateServiceCommand } from '../domain/model/commands/update-service.command';

// Work Order Commands
import { CreateWorkOrderCommand } from '../domain/model/commands/create-work-order.command';
import { UpdateWorkOrderDetailsCommand } from '../domain/model/commands/update-work-order-details.command';

// Task Commands
import { AddTaskToWorkOrderCommand } from '../domain/model/commands/add-task-to-work-order.command';
import { UpdateWorkOrderTaskDetailsCommand } from '../domain/model/commands/update-work-order-task-details.command';

// Product Commands
import { AddProductToTaskCommand } from '../domain/model/commands/add-product-to-task.command';
import { UpdateProductQuantityInTaskCommand } from '../domain/model/commands/update-product-quantity-in-task.command';

@Injectable({ providedIn: 'root' })
export class OperationsStore {
  // --- Signals ---
  private readonly currentBranchServicesSignal = signal<ServiceResource[]>([]);
  private readonly branchWorkOrdersSignal = signal<WorkOrderResource[]>([]);
  private readonly vehicleWorkOrdersSignal = signal<WorkOrderResource[]>([]);
  private readonly activeWorkOrderSignal = signal<WorkOrderResource | null>(null);

  // --- Exposed Readonly Signals ---
  readonly currentBranchServices = this.currentBranchServicesSignal.asReadonly();
  readonly branchWorkOrders = this.branchWorkOrdersSignal.asReadonly();
  readonly vehicleWorkOrders = this.vehicleWorkOrdersSignal.asReadonly();
  readonly activeWorkOrder = this.activeWorkOrderSignal.asReadonly();

  constructor(private api: OperationsApi, private router: Router) {}

  getOperationsApi() {
    return this.api;
  }

  // ==========================================
  // SERVICES
  // ==========================================

  loadServicesByBranchId(branchId: string) {
    this.api.services.getByBranchId(branchId).subscribe({
      next: (services) => this.currentBranchServicesSignal.set(services),
      error: (err) => console.error('Failed to load services:', err)
    });
  }

  createService(command: CreateServiceCommand) {
    this.api.services.create(command).subscribe({
      next: (service) => {
        const currentServices = this.currentBranchServicesSignal();
        this.currentBranchServicesSignal.set([...currentServices, service]);
      },
      error: (err) => console.error('Failed to create service:', err)
    });
  }

  updateService(serviceId: string, command: UpdateServiceCommand) {
    this.api.services.update(serviceId, command).subscribe({
      next: (service) => {
        const currentServices = this.currentBranchServicesSignal().map(s => s.id === service.id ? service : s);
        this.currentBranchServicesSignal.set(currentServices);
      },
      error: (err) => console.error('Failed to update service:', err)
    });
  }

  deleteService(serviceId: string) {
    this.api.services.delete(serviceId).subscribe({
      next: () => {
        const currentServices = this.currentBranchServicesSignal().filter(s => s.id !== serviceId);
        this.currentBranchServicesSignal.set(currentServices);
      },
      error: (err) => console.error('Failed to delete service:', err)
    });
  }

  // ==========================================
  // WORK ORDERS (MAIN)
  // ==========================================

  loadWorkOrdersByBranchId(branchId: string) {
    this.api.workOrders.getByBranchId(branchId).subscribe({
      next: (orders) => this.branchWorkOrdersSignal.set(orders),
      error: (err) => console.error('Failed to load branch work orders:', err)
    });
  }

  loadWorkOrdersByVehicleId(vehicleId: string) {
    this.api.workOrders.getByVehicleId(vehicleId).subscribe({
      next: (orders) => this.vehicleWorkOrdersSignal.set(orders),
      error: (err) => console.error('Failed to load vehicle work orders:', err)
    });
  }

  loadWorkOrderById(id: string) {
    this.api.workOrders.getById(id).subscribe({
      next: (order) => this.activeWorkOrderSignal.set(order),
      error: (err) => console.error('Failed to load active work order:', err)
    });
  }

  getWorkOrderByIdObservable(id: string) {
    return this.api.workOrders.getById(id);
  }

  createWorkOrder(command: CreateWorkOrderCommand, router: Router) {
    this.api.workOrders.create(command).subscribe({
      next: (order) => {
        const currentOrders = this.branchWorkOrdersSignal();
        this.branchWorkOrdersSignal.set([...currentOrders, order]);
        this.activeWorkOrderSignal.set(order);
        router.navigate(['/work-orders'], { queryParams: { expandedOrderId: order.id } }).then();
      },
      error: (err) => console.error('Failed to create work order:', err)
    });
  }

  updateWorkOrderDetails(id: string, command: UpdateWorkOrderDetailsCommand, router: Router) {
    this.api.workOrders.updateDetails(id, command).subscribe({
      next: (order) => {
        this.activeWorkOrderSignal.set(order);
        router.navigate(['/work-orders'], { queryParams: { expandedOrderId: order.id } }).then();
      },
      error: (err) => console.error('Failed to update work order details:', err)
    });
  }

  deleteWorkOrder(id: string) {
    this.api.workOrders.delete(id).subscribe({
      next: () => {
        const currentOrders = this.branchWorkOrdersSignal().filter(o => o.id !== id);
        this.branchWorkOrdersSignal.set(currentOrders);
        if (this.activeWorkOrderSignal()?.id === id) {
          this.activeWorkOrderSignal.set(null);
        }
        // this.router.navigate(['/dashboard']).then();
      },
      error: (err) => console.error('Failed to delete work order:', err)
    });
  }

  // ==========================================
  // TASKS
  // ==========================================

  addTaskToWorkOrder(workOrderId: string, command: AddTaskToWorkOrderCommand) {
    this.api.workOrders.addTask(workOrderId, command).subscribe({
      next: (order) => {
        this.activeWorkOrderSignal.set(order);
        this.branchWorkOrdersSignal.update(orders => orders.map(o => o.id === order.id ? order : o));
      },
      error: (err) => console.error('Failed to add task:', err)
    });
  }

  updateWorkOrderTaskDetails(workOrderId: string, taskId: string, command: UpdateWorkOrderTaskDetailsCommand) {
    this.api.workOrders.updateTaskDetails(workOrderId, taskId, command).subscribe({
      next: (order) => {
        this.activeWorkOrderSignal.set(order);
        this.branchWorkOrdersSignal.update(orders => orders.map(o => o.id === order.id ? order : o));
      },
      error: (err) => console.error('Failed to update task details:', err)
    });
  }

  removeTaskFromWorkOrder(workOrderId: string, taskId: string) {
    this.api.workOrders.removeTask(workOrderId, taskId).subscribe({
      next: (order) => {
        this.activeWorkOrderSignal.set(order);
        this.branchWorkOrdersSignal.update(orders => orders.map(o => o.id === order.id ? order : o));
      },
      error: (err) => console.error('Failed to remove task:', err)
    });
  }


  startTask(taskId: string) {
    this.api.workOrderTasks.startTask(taskId).subscribe({
      next: (order) => {
        this.activeWorkOrderSignal.set(order);
        this.branchWorkOrdersSignal.update(orders => orders.map(o => o.id === order.id ? order : o));
      },
      error: (err) => console.error('Failed to start task:', err)
    });
  }

  completeTask(taskId: string) {
    this.api.workOrderTasks.completeTask(taskId).subscribe({
      next: (order) => {
        this.activeWorkOrderSignal.set(order);
        this.branchWorkOrdersSignal.update(orders => orders.map(o => o.id === order.id ? order : o));
      },
      error: (err) => console.error('Failed to complete task:', err)
    });
  }

  reopenTask(taskId: string) {
    this.api.workOrderTasks.reopenTask(taskId).subscribe({
      next: (order) => {
        this.activeWorkOrderSignal.set(order);
        this.branchWorkOrdersSignal.update(orders => orders.map(o => o.id === order.id ? order : o));
      },
      error: (err) => console.error('Failed to reopen task:', err)
    });
  }

  // ==========================================
  // PRODUCTS
  // ==========================================

  addProductToTask(taskId: string, command: AddProductToTaskCommand) {
    this.api.workOrderTasks.addProductToTask(taskId, command).subscribe({
      next: (order) => this.activeWorkOrderSignal.set(order),
      error: (err) => console.error('Failed to add product to task:', err)
    });
  }

  updateProductQuantityInTask(taskId: string, productId: string, command: UpdateProductQuantityInTaskCommand) {
    this.api.workOrderTasks.updateProductQuantityInTask(taskId, productId, command).subscribe({
      next: (order) => this.activeWorkOrderSignal.set(order),
      error: (err) => console.error('Failed to update product quantity:', err)
    });
  }

  removeProductFromTask(taskId: string, productId: string) {
    this.api.workOrderTasks.removeProductFromTask(taskId, productId).subscribe({
      next: (order) => this.activeWorkOrderSignal.set(order),
      error: (err) => console.error('Failed to remove product from task:', err)
    });
  }
}
