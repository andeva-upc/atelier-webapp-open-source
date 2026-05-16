import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, catchError, of } from 'rxjs';
import { WorkOrder, WorkOrderStatus } from '../domain/models/work-order.entity';
import { WorkOrderRepository } from '../domain/repositories/work-order.repository';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
  })
export class WorkOrderStore {
  private readonly repository = inject(WorkOrderRepository);
  private readonly http = inject(HttpClient);

  private readonly workOrdersSignal = signal<WorkOrder[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly savingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // Readonly signals
  readonly workOrders = this.workOrdersSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly saving = this.savingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // Computed
  readonly workOrdersCount = computed(() => this.workOrders().length);

  /**
   * Loads all work orders and joins them with related data.
   */
  loadWorkOrders(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // Ensure we use the correct API prefix for all resources
    const baseUrl = environment.platformProviderApiBaseUrl;
    
    // Forkjoin to fetch all dependencies in parallel with individual error handling
    forkJoin({
      workOrders: this.repository.getAll().pipe(catchError(() => of([]))),
      customers: this.http.get<any[]>(`${baseUrl}${environment.platformProviderCustomersEndpointPath}`).pipe(catchError(() => of([]))),
      vehicles: this.http.get<any[]>(`${baseUrl}${environment.platformProviderVehiclesEndpointPath}`).pipe(catchError(() => of([]))),
      users: this.http.get<any[]>(`${baseUrl}${environment.platformProviderUsersEndpointPath}`).pipe(catchError(() => of([]))),
      tasks: this.http.get<any[]>(`${baseUrl}${environment.platformProviderWorkOrdersTasksEndpointPath}`).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ workOrders, customers, vehicles, users, tasks }) => {
        // Ensure we are working with arrays
        const safeWorkOrders = Array.isArray(workOrders) ? workOrders : [];
        const safeCustomers = Array.isArray(customers) ? customers : [];
        const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
        const safeUsers = Array.isArray(users) ? users : [];
        const safeTasks = Array.isArray(tasks) ? tasks : [];

        const enrichedWorkOrders = safeWorkOrders.map(wo => {
          const customer = safeCustomers.find(c => c.id === wo.customerId);
          const vehicle = safeVehicles.find(v => v.id === wo.vehicleId);
          const mechanic = safeUsers.find(u => u.id === wo.assignedMechanicId);
          const woTasks = safeTasks.filter(t => t.work_order_id === wo.id);
          
          const serviceName = woTasks.length > 0 ? woTasks[0].description : 'No services';
          const totalAmount = woTasks.reduce((sum, t) => sum + (t.unit_price || 0), 0);

          return new WorkOrder(
            wo.id,
            wo.workshopId,
            wo.internalNumber || 0,
            wo.customerId,
            wo.vehicleId,
            wo.assignedMechanicId,
            wo.driverName,
            wo.driverPhone,
            wo.currentMileage,
            wo.diagnosis,
            wo.status,
            wo.createdAt,
            wo.updatedAt,
            customer?.full_name || 'Unknown Customer',
            vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown Vehicle',
            vehicle?.plate_number || 'N/A',
            mechanic?.full_name || 'Unassigned',
            serviceName,
            totalAmount
          );
        });

        this.workOrdersSignal.set(enrichedWorkOrders);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('WorkOrderStore: Critical error in forkJoin', err);
        this.loadingSignal.set(false);
        this.errorSignal.set('Error loading work orders data');
      }
    });
  }

  updateWorkOrderStatus(id: string, status: WorkOrderStatus): void {
    this.repository.updateStatus(id, status).subscribe({
      next: () => {
        this.workOrdersSignal.update(list => list.map(wo => wo.id === id ? { ...wo, status } as WorkOrder : wo));
      },
      error: () => this.errorSignal.set('Failed to update status')
    });
  }

  createWorkOrder(workOrder: Partial<WorkOrder> & { serviceName?: string }, onSuccess?: () => void): void {
    this.savingSignal.set(true);
    const { serviceName, ...woData } = workOrder;

    this.repository.create(woData).subscribe({
      next: (createdWo) => {
        if (serviceName) {
          const baseUrl = environment.platformProviderApiBaseUrl;
          const task = {
            work_order_id: createdWo.id,
            description: serviceName,
            estimated_hours: 1,
            unit_price: 0,
            status: 'DOING'
          };

          this.http.post(`${baseUrl}${environment.platformProviderWorkOrdersTasksEndpointPath}`, task).subscribe({
            next: () => {
              this.loadWorkOrders();
              this.savingSignal.set(false);
              if (onSuccess) onSuccess();
            },
            error: (err) => {
              console.error('WorkOrderStore: Failed to create initial task', err);
              this.loadWorkOrders();
              this.savingSignal.set(false);
              if (onSuccess) onSuccess();
            }
          });
        } else {
          this.loadWorkOrders();
          this.savingSignal.set(false);
          if (onSuccess) onSuccess();
        }
      },
      error: () => {
        this.savingSignal.set(false);
        this.errorSignal.set('Failed to create work order');
      }
    });
  }
}
