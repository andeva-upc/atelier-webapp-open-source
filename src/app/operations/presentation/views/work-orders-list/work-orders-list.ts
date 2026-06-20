import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CoreStore } from '../../../../core/application/core.store';
import { CoreApi } from '../../../../core/infrastructure/core-api';
import { FleetApi } from '../../../../fleet/infrastructure/fleet-api';
import { OperationsApi } from '../../../infrastructure/operations-api';
import { WorkOrderResource } from '../../../infrastructure/responses/work-order.response';

// ---- View Model -------------------------------------------------------
// Maps the API response to a display-friendly structure for the template.
interface WorkOrderTask {
  id: string;
  number: number;
  description: string;
  status: string;
  assignedMechanicId?: string;
  mechanicName?: string;
}

interface WorkOrderViewModel {
  id: string;
  internalCode: string;
  title: string;
  date: string;
  mechanicName: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'PAID';
  tasks: WorkOrderTask[];
  isExpanded: boolean;
  customerId?: string;
  vehicleId?: string;
  mileageIn?: number;
  totalAmount?: number;
}
// -----------------------------------------------------------------------

@Component({
  selector: 'app-work-orders-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './work-orders-list.html',
  styleUrl: './work-orders-list.css'
})
export class WorkOrdersListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private coreStore = inject(CoreStore);
  private coreApi = inject(CoreApi);
  private fleetApi = inject(FleetApi);
  private operationsApi = inject(OperationsApi);

  isLoading = signal<boolean>(false);
  searchText = signal<string>('');
  selectedStatusFilter = signal<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'PAID'>('ALL');
  isSearchDropdownOpen = signal<boolean>(false);
  selectedOrderForDetails = signal<WorkOrderViewModel | null>(null);
  selectedTaskForDetails = signal<WorkOrderTask | null>(null);
  selectedTaskOrderContext = signal<WorkOrderViewModel | null>(null);

  workOrders = signal<WorkOrderViewModel[]>([]);
  mechanicsMap = signal<Map<string, string>>(new Map());

  constructor() {
    // Reactively load work orders whenever the active branch changes (same
    // pattern as the form view). Fires immediately if branch is already set,
    // or later when the async Owner→Workshop→Branch chain completes.
    effect(() => {
      const branch = this.coreStore.currentBranch();
      if (branch?.id) {
        this.loadWorkOrders(branch.id.toString());
        this.loadMechanics(branch.id.toString());
      }
    });
  }

  ngOnInit() {
    // If returning from create/edit with an expandedOrderId query param,
    // expand that specific order automatically.
    this.route.queryParams.subscribe(params => {
      const expandedId = params['expandedOrderId'];
      if (expandedId) {
        this.workOrders.update(orders =>
          orders.map(order =>
            order.id === expandedId ? { ...order, isExpanded: true } : order
          )
        );
      }
    });
  }

  // ---- Data Loading ----------------------------------------------------

  private loadWorkOrders(branchId: string) {
    this.isLoading.set(true);
    this.operationsApi.workOrders.getByBranchId(branchId).subscribe({
      next: (resources) => {
        const mapped = resources.map(r => this.mapToViewModel(r));
        this.workOrders.set(mapped);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load work orders:', err);
        this.isLoading.set(false);
      }
    });
  }

  private loadMechanics(branchId: string) {
    this.fleetApi.employeeRegistrations.getByBranchId(branchId).subscribe({
      next: (regs) => {
        const activeRegs = regs.filter(r => r.status === 'ACTIVE');
        if (activeRegs.length === 0) {
          this.mechanicsMap.set(new Map());
          return;
        }

        const profileRequests = activeRegs.map(r => this.coreApi.employees.getById(r.employeeId));
        forkJoin(profileRequests).subscribe({
          next: (profiles) => {
            const map = new Map<string, string>();
            profiles.forEach((p, i) => {
              map.set(activeRegs[i].employeeId, `${p.firstName} ${p.lastName}`);
            });
            this.mechanicsMap.set(map);
          },
          error: (err) => console.error('Failed to load mechanic profiles:', err)
        });
      },
      error: (err) => console.error('Failed to load employee registrations:', err)
    });
  }

  /** Maps a raw WorkOrderResource from the API to the display ViewModel. */
  private mapToViewModel(r: WorkOrderResource): WorkOrderViewModel {
    // Use formattedNumber from the API response if available
    const internalCode = r.formattedNumber || `WO-${String(r.internalNumber).padStart(4, '0')}`;

    return {
      id: r.id,
      internalCode,
      // Use the diagnostic summary as the card title
      title: r.diagnosticSummary || '(Sin diagnóstico)',
      // Format the creation date from backend if present
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '',
      // Mechanic info is task-level, not order-level in this API
      mechanicName: '',
      status: r.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'PAID',
      customerId: r.customerId,
      vehicleId: r.vehicleId,
      mileageIn: r.mileageIn,
      totalAmount: r.totalAmount,
      isExpanded: false,
      tasks: (r.tasks || []).map((t, index) => ({
        id: t.id,
        number: index + 1,
        description: t.description || '',
        status: t.status,
        assignedMechanicId: t.assignedMechanicId
      }))
    };
  }

  // ---- Computed Properties ---------------------------------------------

  filteredWorkOrders = computed(() => {
    const search = this.searchText().toLowerCase().trim();
    const status = this.selectedStatusFilter();
    const list = this.workOrders();
    const map = this.mechanicsMap();

    // Map mechanic names reactively
    const mappedList = list.map(order => ({
      ...order,
      tasks: order.tasks.map(task => ({
        ...task,
        mechanicName: task.assignedMechanicId ? (map.get(task.assignedMechanicId) || 'Cargando...') : 'No asignado'
      }))
    }));

    let result = mappedList;

    if (status !== 'ALL') {
      result = result.filter(order => order.status === status);
    }

    if (search !== '') {
      result = result.filter(order =>
        order.internalCode.toLowerCase().includes(search) ||
        order.title.toLowerCase().includes(search)
      );
    }

    return result;
  });

  searchSuggestions = computed(() => {
    const search = this.searchText().toLowerCase().trim();
    if (search === '') return [];
    return this.workOrders().filter(order =>
      order.internalCode.toLowerCase().includes(search) ||
      order.title.toLowerCase().includes(search)
    );
  });

  // ---- Action Methods --------------------------------------------------

  selectStatus(status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'PAID') {
    // Pressing the same active filter toggles it off (shows ALL)
    if (this.selectedStatusFilter() === status) {
      this.selectedStatusFilter.set('ALL');
    } else {
      this.selectedStatusFilter.set(status);
    }
  }

  toggleExpand(orderId: string) {
    this.workOrders.update(orders =>
      orders.map(order =>
        order.id === orderId ? { ...order, isExpanded: !order.isExpanded } : order
      )
    );
  }

  onSearchInputFocus() {
    this.isSearchDropdownOpen.set(true);
  }

  onSearchInputBlur() {
    setTimeout(() => {
      this.isSearchDropdownOpen.set(false);
    }, 200);
  }

  selectSuggestion(suggestionCode: string) {
    this.searchText.set(suggestionCode);
    this.isSearchDropdownOpen.set(false);
  }

  openDetails(order: WorkOrderViewModel) {
    this.selectedOrderForDetails.set(order);
  }

  closeDetails() {
    this.selectedOrderForDetails.set(null);
  }

  openTaskDetails(order: WorkOrderViewModel, task: WorkOrderTask) {
    this.selectedTaskOrderContext.set(order);
    this.selectedTaskForDetails.set(task);
  }

  closeTaskDetails() {
    this.selectedTaskOrderContext.set(null);
    this.selectedTaskForDetails.set(null);
  }
}
