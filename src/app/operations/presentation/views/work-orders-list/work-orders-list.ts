import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

import { OperationsStore } from '../../../application/operations.store';
import { CoreStore } from '../../../../core/application/core.store';
import { WorkOrderResource } from '../../../infrastructure/responses/work-order.response';
import { CustomerNameComponent } from '../../../../core/presentation/components/customer-name/customer-name';
import { MechanicNameComponent } from '../../../../fleet/presentation/components/mechanic-name/mechanic-name';
import { BillingStore } from '../../../../billing/application/billing.store';
import { CreateQuoteCommand } from '../../../../billing/domain/model/commands/quote-commands';



// ---- View Model -------------------------------------------------------
interface WorkOrderTask {
  id: string;
  number: number;
  description: string;
  status: string;
  assignedMechanicId?: string;
}

interface WorkOrderViewModel {
  id: string;
  internalCode: string;
  title: string;
  date: string;
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
  imports: [CommonModule, FormsModule, RouterModule, CustomerNameComponent, MechanicNameComponent],
  templateUrl: './work-orders-list.html',
  styleUrl: './work-orders-list.css'
})


export class WorkOrdersListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private operationsStore = inject(OperationsStore);
  private coreStore = inject(CoreStore);
  private billingStore = inject(BillingStore);

  searchText = signal<string>('');
  selectedStatusFilter = signal<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'PAID'>('ALL');
  isSearchDropdownOpen = signal<boolean>(false);
  selectedOrderForDetails = signal<WorkOrderViewModel | null>(null);
  selectedTaskForDetails = signal<WorkOrderTask | null>(null);
  selectedTaskOrderContext = signal<WorkOrderViewModel | null>(null);

  workOrders = computed(() => {
    return this.operationsStore.branchWorkOrders().map(r => this.mapToViewModel(r));
  });

  constructor() {
    effect(() => {
      const branch = this.coreStore.currentBranch();
      if (branch?.id) {
        this.operationsStore.loadWorkOrdersByBranchId(branch.id.toString());
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    const branch = this.coreStore.currentBranch();
    if (branch?.id) {
      this.operationsStore.loadWorkOrdersByBranchId(branch.id.toString());
    }

    this.route.queryParams.subscribe(params => {
      const expandedId = params['expandedOrderId'];
      if (expandedId) {
        // Expand the specific order. Note: We could handle this using a separate signal for expanded state map.
        // For simplicity, we just toggle it if it's found in the UI.
        setTimeout(() => this.toggleExpand(expandedId), 100);
      }
    });
  }


  private mapToViewModel(r: WorkOrderResource): WorkOrderViewModel {
    const internalCode = r.formattedNumber || `WO-${String(r.internalNumber).padStart(4, '0')}`;
    return {
      id: r.id,
      internalCode,
      title: r.diagnosticSummary || '(Sin diagnóstico)',
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '',
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
  
  // A local map to keep track of expanded states so they persist across signal updates
  expandedStateMap = signal<Record<string, boolean>>({});

  filteredWorkOrders = computed(() => {
    const search = this.searchText().toLowerCase().trim();
    const status = this.selectedStatusFilter();
    let result = this.workOrders();

    if (status !== 'ALL') {
      result = result.filter(order => order.status === status);
    }

    if (search !== '') {
      result = result.filter(order =>
        order.internalCode.toLowerCase().includes(search) ||
        order.title.toLowerCase().includes(search)
      );
    }

    // Apply expanded states
    const expandedMap = this.expandedStateMap();
    return result.map(o => ({ ...o, isExpanded: !!expandedMap[o.id] }));
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
    if (this.selectedStatusFilter() === status) {
      this.selectedStatusFilter.set('ALL');
    } else {
      this.selectedStatusFilter.set(status);
    }
  }

  toggleExpand(orderId: string) {
    this.expandedStateMap.update(map => ({
      ...map,
      [orderId]: !map[orderId]
    }));
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

  createQuoteForOrder(order: WorkOrderViewModel) {
    const branch = this.coreStore.currentBranch();
    if (branch?.id) {
      this.billingStore.createQuote(new CreateQuoteCommand(
        order.id,
        branch.id.toString(),
        0.0
      ));
      this.router.navigate(['/billing']).then();
    }
  }

  deleteWorkOrder(orderId: string) {
    if (confirm('¿Estás seguro de que deseas eliminar esta orden de trabajo?')) {
      this.operationsStore.deleteWorkOrder(orderId);
    }
  }

  deleteTask(orderId: string, taskId: string) {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      this.operationsStore.removeTaskFromWorkOrder(orderId, taskId);
    }
  }
}
