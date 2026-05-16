import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { WorkOrder } from '../../../domain/models/work-order.entity';

@Component({
  selector: 'app-work-order-detail',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatButtonModule, MatDividerModule],
  templateUrl: './work-order-detail.component.html',
  styleUrls: ['./work-order-detail.component.css']
})
export class WorkOrderDetailComponent {
  workOrder = input.required<WorkOrder>();
  closed = output<void>();

  onClose(): void {
    this.closed.emit();
  }
}
