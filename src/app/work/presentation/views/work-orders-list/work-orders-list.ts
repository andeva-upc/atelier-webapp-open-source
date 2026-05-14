import { Component, OnInit, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { WorkOrdersStore } from '../../../application/work-orders.store';
import { WorkOrderListItem } from '../../../domain/models/work-order.entity';
import { TranslateModule } from '@ngx-translate/core';
import { Modal } from '../../../../shared/presentation/modal/modal';
import { WorkOrderForm } from '../work-order-form/work-order-form';
import { WorkOrderDetail } from '../work-order-detail/work-order-detail';

/**
 * View component for displaying and filtering the list of work orders.
 * 
 * Uses WorkOrdersStore for reactive state management and Angular Material for the UI.
 * Supports internationalization via TranslateModule.
 */
@Component({
  selector: 'app-work-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    TranslateModule,
    Modal,
    WorkOrderForm,
    WorkOrderDetail
  ],
  templateUrl: './work-orders-list.html',
  styleUrls: ['./work-orders-list.css']
})
export class WorkOrdersList implements OnInit {
  private readonly store = inject(WorkOrdersStore);

  displayedColumns: string[] = ['internalNumber', 'customerName', 'vehicleInfo', 'serviceDescription', 'mechanicName', 'date', 'status', 'amount', 'actions'];
  dataSource = new MatTableDataSource<WorkOrderListItem>();
  
  readonly totalOrders = this.store.totalOrdersCount;
  readonly isLoading = this.store.loading;

  /** Signal to toggle the new work order creation modal */
  readonly isModalOpen = signal<boolean>(false);

  /** Signal to toggle the work order detail modal */
  readonly isDetailModalOpen = signal<boolean>(false);

  /** Signal to store the currently selected work order for details */
  readonly selectedWorkOrder = signal<any>(null);

  constructor() {
    // Reactively update the data source when the store signal changes
    effect(() => {
      this.dataSource.data = this.store.workOrdersList();
    });
  }

  ngOnInit(): void {
    this.store.loadWorkOrders();
  }

  /**
   * Applies a text filter to the table data source.
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Returns the CSS class for the status badge based on work order status.
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'status-completed';
      case 'IN_PROGRESS': return 'status-in-progress';
      case 'SCHEDULED': return 'status-pending';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }

  /**
   * Opens the work order creation modal.
   */
  openModal(): void {
    this.isModalOpen.set(true);
  }

  /**
   * Closes the work order creation modal.
   */
  closeModal(): void {
    this.isModalOpen.set(false);
  }

  /**
   * Triggers background list reload after a work order is saved successfully.
   */
  onWorkOrderSaved(): void {
    this.closeModal();
    // The store already handles reloading in saveWorkOrder
  }

  /**
   * Opens the work order detail modal.
   * 
   * @param workOrder - The work order to display details for.
   */
  openDetailModal(workOrder: any): void {
    this.selectedWorkOrder.set(workOrder);
    this.isDetailModalOpen.set(true);
  }

  /**
   * Closes the work order detail modal.
   */
  closeDetailModal(): void {
    this.isDetailModalOpen.set(false);
    this.selectedWorkOrder.set(null);
  }
}
