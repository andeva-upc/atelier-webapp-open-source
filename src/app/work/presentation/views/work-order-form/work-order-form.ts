import { Component, OnInit, signal, inject, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { WorkOrdersStore } from '../../../application/work-orders.store';
import { CustomerRepository } from '../../../../customers/domain/repositories/customer.repository';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { WorkOrder, WorkOrderStatus } from '../../../domain/models/work-order.entity';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  matPersonSearch, 
  matDirectionsCar, 
  matSpeed, 
  matPin, 
  matEngineering, 
  matAssignment,
  matArrowDropDown
} from '@ng-icons/material-icons/baseline';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-work-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, NgIcon, MatButtonModule],
  providers: [
    provideIcons({ 
      matPersonSearch, 
      matDirectionsCar, 
      matSpeed, 
      matPin, 
      matEngineering, 
      matAssignment,
      matArrowDropDown
    })
  ],
  templateUrl: './work-order-form.html',
  styleUrls: ['./work-order-form.css']
})
export class WorkOrderForm implements OnInit {
  private readonly store = inject(WorkOrdersStore);
  private readonly customerRepository = inject(CustomerRepository);
  private readonly http = inject(HttpClient);

  @Output() saved = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  /** Form State */
  readonly woForm = new FormGroup({
    customerId: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    vehicleId: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    currentMileage: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    licensePlate: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    diagnosis: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    assignedMechanicId: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] })
  });

  /** Data for Selects */
  customers = signal<any[]>([]);
  allVehicles = signal<any[]>([]);
  mechanics = signal<any[]>([]);

  /** Signals for reactive filtering */
  private readonly selectedCustomerId = toSignal(this.woForm.get('customerId')!.valueChanges);
  
  readonly filteredVehicles = computed(() => {
    const customerId = this.selectedCustomerId();
    if (!customerId) return [];
    return this.allVehicles().filter(v => v.customer_id === customerId);
  });

  ngOnInit(): void {
    this.loadFormData();
    
    // Reset vehicle when customer changes
    this.woForm.get('customerId')?.valueChanges.subscribe(() => {
      this.woForm.patchValue({ vehicleId: '', licensePlate: '' });
    });

    // Auto-fill plate when vehicle changes
    this.woForm.get('vehicleId')?.valueChanges.subscribe(vId => {
      const vehicle = this.allVehicles().find(v => v.id === vId);
      if (vehicle) {
        this.woForm.patchValue({ licensePlate: vehicle.plate_number });
      }
    });
  }

  private loadFormData(): void {
    // Load Customers
    this.customerRepository.getAll().subscribe(data => this.customers.set(data));
    
    // Load Vehicles
    this.http.get<any[]>(`${environment.platformProviderApiBaseUrl}${environment.platformProviderVehiclesEndpointPath}`)
      .subscribe(data => this.allVehicles.set(data));
      
    // Load Mechanics
    this.http.get<any[]>(`${environment.platformProviderApiBaseUrl}${environment.platformProviderUsersEndpointPath}`)
      .subscribe(data => {
        const filtered = data.filter(u => u.role === 'MECHANIC');
        this.mechanics.set(filtered);
      });
  }

  onSubmit(): void {
    if (this.woForm.invalid) {
      this.woForm.markAllAsTouched();
      return;
    }

    const formVal = this.woForm.getRawValue();
    const customer = this.customers().find(c => c.id === formVal.customerId);
    
    const newWO = new WorkOrder(
      crypto.randomUUID(),
      'e26b1580-b3b0-466d-8c10-ca7f62d1c9ef',
      'b1ba1580-b3b0-466d-8c10-ca7f62d1c9aa',
      Math.floor(1000 + Math.random() * 9000),
      formVal.customerId,
      formVal.vehicleId,
      formVal.assignedMechanicId,
      customer?.fullName || '', 
      customer?.phone || '',     
      formVal.currentMileage,
      formVal.licensePlate,
      formVal.diagnosis,
      WorkOrderStatus.IN_PROGRESS,
      new Date().toISOString(),
      new Date().toISOString()
    );

    this.store.createWorkOrder(newWO).subscribe(() => {
      this.saved.emit();
    });
  }
}
