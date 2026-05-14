import { Component, EventEmitter, Output, input, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { WorkOrder, WorkOrderTask } from '../../../domain/models/work-order.entity';

@Component({
  selector: 'app-work-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    TranslateModule
  ],
  templateUrl: './work-order-detail.html',
  styleUrls: ['./work-order-detail.css']
})
export class WorkOrderDetail {
  private readonly http = inject(HttpClient);

  /** Signal input for the work order to display */
  workOrder = input<any>(null);
  
  @Output() close = new EventEmitter<void>();

  tasks = signal<WorkOrderTask[]>([]);
  isLoadingTasks = signal<boolean>(false);

  private readonly tasksUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderWorkOrdersTasksEndpointPath}`;

  constructor() {
    effect(() => {
      const wo = this.workOrder();
      if (wo && wo.id) {
        this.loadTasks(wo.id);
      }
    });
  }

  loadTasks(workOrderId: string | number): void {
    this.isLoadingTasks.set(true);
    this.http.get<any[]>(`${this.tasksUrl}?work_order_id=${workOrderId}`)
      .pipe(
        map(rawTasks => rawTasks.map(t => ({
          id: t.id,
          workOrderId: t.work_order_id,
          description: t.description,
          estimatedHours: t.estimated_hours,
          unitPrice: t.unit_price,
          status: t.status
        } as WorkOrderTask)))
      )
      .subscribe({
        next: (data) => {
          this.tasks.set(data);
          this.isLoadingTasks.set(false);
        },
        error: () => {
          this.isLoadingTasks.set(false);
        }
      });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'status-completed';
      case 'IN_PROGRESS': return 'status-in-progress';
      case 'SCHEDULED': return 'status-pending';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
