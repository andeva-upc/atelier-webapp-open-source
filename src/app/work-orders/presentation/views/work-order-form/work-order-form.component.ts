import { Component, OnInit, inject, signal, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '../../../../../environments/environment';
import { WorkOrderStore } from '../../../application/work-order.store';

@Component({
  selector: 'app-work-order-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './work-order-form.component.html',
  styleUrls: ['./work-order-form.component.css']
})
export class WorkOrderFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly store = inject(WorkOrderStore);

  saved = output<void>();
  cancelled = output<void>();

  workOrderForm: FormGroup = this.fb.group({
    customerId: ['', Validators.required],
    vehicleId: ['', Validators.required],
    currentMileage: [0, [Validators.required, Validators.min(0)]],
    plateNumber: ['', Validators.required],
    assignedMechanicId: ['', Validators.required],
    serviceName: ['', Validators.required],
    diagnosis: ['', Validators.required]
  });

  customers = signal<any[]>([]);
  vehicles = signal<any[]>([]);
  mechanics = signal<any[]>([]);

  // Use toSignal to make the form field value reactive for the computed signal
  private customerIdSignal = toSignal(this.workOrderForm.get('customerId')!.valueChanges, { initialValue: '' });

  filteredVehicles = computed(() => {
    const customerId = this.customerIdSignal();
    return this.vehicles().filter(v => v.customer_id === customerId);
  });

  isSaving = this.store.saving;

  ngOnInit(): void {
    this.loadInitialData();
    
    // Auto-fill plate when vehicle changes
    this.workOrderForm.get('vehicleId')?.valueChanges.subscribe(vehicleId => {
      const vehicle = this.vehicles().find(v => v.id === vehicleId);
      if (vehicle) {
        this.workOrderForm.patchValue({ plateNumber: vehicle.plate_number });
      }
    });

    // Reset vehicle when customer changes
    this.workOrderForm.get('customerId')?.valueChanges.subscribe(() => {
      this.workOrderForm.patchValue({ vehicleId: '', plateNumber: '' });
    });
  }

  private loadInitialData(): void {
    const rootBaseUrl = environment.platformProviderApiBaseUrl.replace('/api/v1', '');
    this.http.get<any[]>(`${rootBaseUrl}/customers`).subscribe(data => this.customers.set(data));
    this.http.get<any[]>(`${rootBaseUrl}/vehicles`).subscribe(data => this.vehicles.set(data));
    this.http.get<any[]>(`${rootBaseUrl}/users`).subscribe(data => {
      this.mechanics.set(data.filter(u => u.role === 'MECHANIC'));
    });
  }

  onSubmit(): void {
    if (this.workOrderForm.valid) {
      const formValue = this.workOrderForm.value;
      const customer = this.customers().find(c => c.id === formValue.customerId);
      
      const newWo = {
        ...formValue,
        workshopId: 'e26b1580-b3b0-466d-8c10-ca7f62d1c9ef',
        driverName: customer?.full_name || '',
        driverPhone: customer?.phone || '',
        status: 'SCHEDULED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.store.createWorkOrder(newWo, () => {
        this.saved.emit();
      });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
