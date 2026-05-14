import { Injectable, computed, signal, inject } from '@angular/core';
import { forkJoin, map } from 'rxjs';
import { WorkOrder, WorkOrderListItem } from '../domain/models/work-order.entity';
import { WorkOrderRepository } from '../domain/repositories/work-order.repository';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Application service managing work orders domain state and orchestration.
 * 
 * Coordinates interactions with the infrastructure layer (WorkOrdersApi)
 * and provides reactive state queries via Angular signals.
 */
@Injectable({
  providedIn: 'root',
})
export class WorkOrdersStore {
  private readonly repository = inject(WorkOrderRepository);
  private readonly http = inject(HttpClient);

  // External URLs for joining data (Simplified for this exercise)
  private readonly customersUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderCustomersEndpointPath}`;
  private readonly vehiclesUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderVehiclesEndpointPath}`;
  private readonly usersUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderUsersEndpointPath}`;
  private readonly tasksUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderWorkOrdersTasksEndpointPath}`;

  private readonly workOrdersSignal = signal<WorkOrder[]>([]);
  private readonly workOrdersListSignal = signal<WorkOrderListItem[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly workOrders = this.workOrdersSignal.asReadonly();
  readonly workOrdersList = this.workOrdersListSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly totalOrdersCount = computed(() => this.workOrdersList().length);

  /**
   * Loads work orders and joins them with customers, vehicles, and mechanics.
   */
  loadWorkOrders(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    forkJoin({
      workOrders: this.repository.getAll(),
      customers: this.http.get<any[]>(this.customersUrl),
      vehicles: this.http.get<any[]>(this.vehiclesUrl),
      users: this.http.get<any[]>(this.usersUrl),
      tasks: this.http.get<any[]>(this.tasksUrl)
    }).subscribe({
      next: ({ workOrders, customers, vehicles, users, tasks }) => {
        this.workOrdersSignal.set(workOrders);
        
        const mappedList = workOrders.map(wo => {
          const customer = customers.find(c => c.id === wo.customerId);
          const vehicle = vehicles.find(v => v.id === wo.vehicleId);
          const mechanic = users.find(u => u.id === wo.assignedMechanicId);
          const woTasks = tasks.filter(t => t.work_order_id === wo.id);
          const totalAmount = woTasks.reduce((acc, t) => acc + (t.unit_price || 0), 0);

          return {
            id: wo.id,
            internalNumber: `OT-${wo.internalNumber.toString().padStart(3, '0')}`,
            customerName: customer ? customer.full_name : 'N/A',
            vehicleInfo: vehicle ? `${vehicle.brand} ${vehicle.model}` : 'N/A',
            plateNumber: vehicle ? vehicle.plate_number : 'N/A',
            serviceDescription: wo.diagnosis,
            mechanicName: mechanic ? mechanic.full_name : 'N/A',
            date: wo.createdAt.split('T')[0],
            status: wo.status,
            amount: totalAmount
          };
        });

        this.workOrdersListSignal.set(mappedList);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.loadingSignal.set(false);
        this.errorSignal.set('Failed to load work orders');
      }
    });
  }

  /**
   * Saves a new work order and reloads the list.
   * 
   * @param workOrder - The work order data to save.
   */
  saveWorkOrder(workOrder: Partial<WorkOrder>): void {
    this.loadingSignal.set(true);
    this.repository.create(workOrder).subscribe({
      next: () => {
        this.loadWorkOrders();
      },
      error: (err) => {
        this.loadingSignal.set(false);
        this.errorSignal.set('Failed to save work order');
      }
    });
  }
}
