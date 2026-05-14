import { Component, EventEmitter, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { WorkOrdersStore } from '../../../application/work-orders.store';
import { WorkOrder } from '../../../domain/models/work-order.entity';

@Component({
  selector: 'app-work-order-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './work-order-form.html',
  styleUrls: ['./work-order-form.css']
})
export class WorkOrderForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(WorkOrdersStore);
  private readonly http = inject(HttpClient);

  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  workOrderForm: FormGroup;
  
  // Data for selects
  customers = signal<any[]>([]);
  vehicles = signal<any[]>([]);
  mechanics = signal<any[]>([]);

  private readonly customersUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderCustomersEndpointPath}`;
  private readonly vehiclesUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderVehiclesEndpointPath}`;
  private readonly usersUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderUsersEndpointPath}`;

  constructor() {
    this.workOrderForm = this.fb.group({
      customerId: ['', Validators.required],
      vehicleId: ['', Validators.required],
      assignedMechanicId: ['', Validators.required],
      driverName: ['', Validators.required],
      driverPhone: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      currentMileage: [0, [Validators.required, Validators.min(0)]],
      diagnosis: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadFormData();
  }

  loadFormData(): void {
    this.http.get<any[]>(this.customersUrl).subscribe(data => this.customers.set(data));
    this.http.get<any[]>(this.vehiclesUrl).subscribe(data => this.vehicles.set(data));
    this.http.get<any[]>(this.usersUrl).subscribe(data => {
        // Filter users who are mechanics (assuming role field or just all users for now)
        this.mechanics.set(data);
    });
  }

  onSubmit(): void {
    if (this.workOrderForm.valid) {
      const formValue = this.workOrderForm.value;
      const newWorkOrder: Partial<WorkOrder> = {
        ...formValue,
        branchId: 'BRANCH-001', // Default branch
        internalNumber: Math.floor(Math.random() * 1000), // Should be handled by backend
        status: 'SCHEDULED',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.store.saveWorkOrder(newWorkOrder);
      this.saved.emit();
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
