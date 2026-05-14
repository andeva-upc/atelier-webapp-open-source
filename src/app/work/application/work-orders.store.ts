import { Injectable, signal, inject, computed } from '@angular/core';
import { forkJoin, map, switchMap, of } from 'rxjs';
import { WorkOrderRepository } from '../domain/repositories/work-order.repository';
import { WorkOrder, WorkOrderStatus } from '../domain/models/work-order.entity';
import { CustomerRepository } from '../../customers/domain/repositories/customer.repository';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Application Store for managing Work Orders state.
 * Handles data orchestration by joining work orders with customers, vehicles, mechanics, and tasks.
 */
@Injectable({ providedIn: 'root' })
export class WorkOrdersStore {
  private readonly repository = inject(WorkOrderRepository);
  private readonly customerRepository = inject(CustomerRepository);
  private readonly http = inject(HttpClient);

  private readonly workOrdersSignal = signal<WorkOrder[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly searchTermSignal = signal<string>('');

  readonly workOrders = this.workOrdersSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly count = computed(() => this.filteredWorkOrders().length);
  readonly searchTerm = this.searchTermSignal.asReadonly();

  /**
   * Computed signal that returns work orders filtered by the search term.
   */
  readonly filteredWorkOrders = computed(() => {
    const term = this.searchTermSignal().toLowerCase().trim();
    if (!term) return this.workOrdersSignal();

    return this.workOrdersSignal().filter(order => 
      `OT-${order.internalNumber}`.toLowerCase().includes(term) ||
      order.customerName?.toLowerCase().includes(term) ||
      order.vehicleInfo?.toLowerCase().includes(term) ||
      order.vehiclePlate?.toLowerCase().includes(term) ||
      order.driverName?.toLowerCase().includes(term)
    );
  });

  /**
   * Loads all work orders and joins them with related entities for the UI.
   */
  loadWorkOrders(): void {
    this.loadingSignal.set(true);
    
    this.repository.getAll().pipe(
      switchMap(orders => {
        if (orders.length === 0) return of({ orders: [], customers: [], vehicles: [], mechanics: [], tasks: [] });
        
        return forkJoin({
          orders: of(orders),
          customers: this.customerRepository.getAll(),
          vehicles: this.http.get<any[]>(`${environment.platformProviderApiBaseUrl}${environment.platformProviderVehiclesEndpointPath}`),
          mechanics: this.http.get<any[]>(`${environment.platformProviderApiBaseUrl}${environment.platformProviderUsersEndpointPath}`),
          tasks: this.http.get<any[]>(`${environment.platformProviderApiBaseUrl}${environment.platformProviderWorkOrdersTasksEndpointPath}`)
        });
      }),
      map(({ orders, customers, vehicles, mechanics, tasks }) => {
        return (orders as WorkOrder[]).map(order => {
          const customer = customers.find(c => c.id === order.customerId);
          const vehicle = (vehicles as any[]).find(v => v.id === order.vehicleId);
          const mechanic = (mechanics as any[]).find(m => m.id === order.assignedMechanicId);
          const orderTasks = (tasks as any[]).filter(t => t.work_order_id === order.id);
          
          const totalAmount = orderTasks.reduce((sum: number, t: any) => sum + (t.unit_price || 0), 0);
          const mainService = orderTasks.length > 0 ? orderTasks[0].description : '';
          
          // Enrich the entity with display properties
          return {
            ...order,
            customerName: customer?.fullName || 'Desconocido',
            vehicleInfo: vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.plate_number})` : 'Desconocido',
            vehicleModel: vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Desconocido',
            vehiclePlate: vehicle ? vehicle.plate_number : '',
            mechanicName: mechanic?.full_name || 'Sin asignar',
            driverName: order.driverName,
            totalAmount,
            mainService
          } as WorkOrder;
        });
      })
    ).subscribe({
      next: (data) => {
        this.workOrdersSignal.set(data);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error loading work orders:', err);
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Updates the search term to filter the work orders list.
   * @param term - The new search term string.
   */
  setSearchTerm(term: string): void {
    this.searchTermSignal.set(term);
  }

  /**
   * Persists a new work order to the backend and refreshes the local list.
   * @param workOrder - The new WorkOrder entity to save.
   * @returns Observable of the saved WorkOrder.
   */
  createWorkOrder(workOrder: WorkOrder) {
    this.loadingSignal.set(true);
    return this.repository.create(workOrder).pipe(
      map(saved => {
        this.loadWorkOrders(); // Refresh the list
        return saved;
      })
    );
  }
  /**
   * Updates the status of an existing work order.
   * @param orderId - ID of the order to update.
   * @param status - New status to apply.
   */
  updateWorkOrderStatus(orderId: string, status: WorkOrderStatus): void {
    this.loadingSignal.set(true);
    const existing = this.workOrdersSignal().find(o => o.id === orderId);
    if (!existing) return;

    const updated = { ...existing, status } as WorkOrder;
    this.repository.update(orderId, updated).subscribe(() => {
      this.loadWorkOrders();
    });
  }
}
