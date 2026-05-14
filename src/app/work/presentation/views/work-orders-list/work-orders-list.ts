import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { WorkOrdersStore } from '../../../application/work-orders.store';
import { WorkOrderStatus, WorkOrder } from '../../../domain/models/work-order.entity';
import { Modal } from '../../../../shared/presentation/modal/modal';
import { MatMenuModule } from '@angular/material/menu';
import { WorkOrderForm } from '../work-order-form/work-order-form';

@Component({
  selector: 'app-work-orders-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatIconModule, Modal, WorkOrderForm, MatMenuModule],
  templateUrl: './work-orders-list.html',
  styleUrls: ['./work-orders-list.css']
})
export class WorkOrdersList implements OnInit {
  protected readonly store = inject(WorkOrdersStore);

  /** Modal State */
  isModalOpen = signal(false);
  isCreateModalOpen = signal(false);
  selectedOrder = signal<WorkOrder | null>(null);

  /** Status Options */
  statusOptions = Object.values(WorkOrderStatus);

  ngOnInit(): void {
    this.store.loadWorkOrders();
  }

  getStatusClass(status: WorkOrderStatus): string {
    switch (status) {
      case WorkOrderStatus.DRAFT: return 'status-draft';
      case WorkOrderStatus.DIAGNOSING: return 'status-diagnosing';
      case WorkOrderStatus.IN_PROGRESS: return 'status-in-progress';
      case WorkOrderStatus.COMPLETED: return 'status-completed';
      case WorkOrderStatus.INVOICED: return 'status-invoiced';
      default: return '';
    }
  }

  getStatusLabelKey(status: WorkOrderStatus): string {
    switch (status) {
      case WorkOrderStatus.DRAFT: return 'work.status.draft';
      case WorkOrderStatus.DIAGNOSING: return 'work.status.diagnosing';
      case WorkOrderStatus.IN_PROGRESS: return 'work.status.in-progress';
      case WorkOrderStatus.COMPLETED: return 'work.status.completed';
      case WorkOrderStatus.INVOICED: return 'work.status.invoiced';
      default: return status;
    }
  }

  onStatusChange(orderId: string, status: WorkOrderStatus): void {
    this.store.updateWorkOrderStatus(orderId, status);
  }

  viewDetail(order: WorkOrder): void {
    this.selectedOrder.set(order);
    this.isModalOpen.set(true);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.store.setSearchTerm(input.value);
  }

  openCreateModal(): void {
    this.isCreateModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.isCreateModalOpen.set(false);
    this.selectedOrder.set(null);
  }
}
