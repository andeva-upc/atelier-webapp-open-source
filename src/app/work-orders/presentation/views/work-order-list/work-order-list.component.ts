import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WorkOrderStore } from '../../../application/work-order.store';
import { WorkOrder, WorkOrderStatus } from '../../../domain/models/work-order.entity';
import { SharedModalComponent } from '../../../../shared/presentation/modal/modal';
import { WorkOrderFormComponent } from '../work-order-form/work-order-form.component';
import { WorkOrderDetailComponent } from '../work-order-detail/work-order-detail.component';

@Component({
  selector: 'app-work-order-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    SharedModalComponent,
    WorkOrderFormComponent,
    WorkOrderDetailComponent
  ],
  templateUrl: './work-order-list.component.html',
  styleUrls: ['./work-order-list.component.css']
})
export class WorkOrderListComponent implements OnInit {
  private readonly store = inject(WorkOrderStore);

  readonly workOrders = this.store.workOrders;
  readonly loading = this.store.loading;
  readonly count = this.store.workOrdersCount;

  readonly searchQuery = signal<string>('');
  readonly isNewModalOpen = signal<boolean>(false);
  readonly isDetailModalOpen = signal<boolean>(false);
  readonly selectedWorkOrder = signal<WorkOrder | null>(null);

  readonly filteredWorkOrders = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const list = this.workOrders();
    
    if (!query) return list;

    return list.filter(wo => {
      const internalNumber = wo.internalNumber?.toString().toLowerCase() || '';
      const customerName = wo.customerName?.toLowerCase() || '';
      const plateNumber = wo.plateNumber?.toLowerCase() || '';
      const vehicleInfo = wo.vehicleInfo?.toLowerCase() || '';
      
      return internalNumber.includes(query) ||
             customerName.includes(query) ||
             plateNumber.includes(query) ||
             vehicleInfo.includes(query);
    });
  });

  displayedColumns: string[] = [
    'internalNumber',
    'customerName',
    'vehicleInfo',
    'serviceName',
    'mechanicName',
    'createdAt',
    'status',
    'totalAmount',
    'actions'
  ];

  statusOptions = Object.values(WorkOrderStatus);

  ngOnInit(): void {
    this.store.loadWorkOrders();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  getStatusClass(status: string): string {
    if (!status) return 'status-chip';
    return `status-chip status-${status.toLowerCase().replace('_', '-')}`;
  }

  changeStatus(id: string, status: any): void {
    this.store.updateWorkOrderStatus(id, status as WorkOrderStatus);
  }

  openNewWoModal(): void {
    this.isNewModalOpen.set(true);
  }

  closeNewWoModal(): void {
    this.isNewModalOpen.set(false);
  }

  viewDetail(wo: WorkOrder): void {
    this.selectedWorkOrder.set(wo);
    this.isDetailModalOpen.set(true);
  }

  closeDetailModal(): void {
    this.isDetailModalOpen.set(false);
    this.selectedWorkOrder.set(null);
  }
}
