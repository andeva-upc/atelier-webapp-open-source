import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { finalize, map, startWith, Observable, forkJoin, of, catchError } from 'rxjs';

import { AppointmentsApiEndpoint } from '../../../infrastructure/endpoints/appointments.endpoint';
import { CustomerRegistrationsApiEndpoint } from '../../../infrastructure/endpoints/customer-registrations.endpoint';
import { VehiclesApiEndpoint } from '../../../../iot/infrastructure/endpoints/vehicles.endpoint';
import { CoreApi } from '../../../../core/infrastructure/core-api';

import { CreateAppointmentCommand } from '../../../domain/model/commands/create-appointment.command';
import { UpdateAppointmentCommand } from '../../../domain/model/commands/update-appointment.command';
import { AppointmentResource } from '../../../infrastructure/responses/appointment.response';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  templateUrl: './appointment-form.html',
  styleUrls: ['./appointment-form.css']
})
export class AppointmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  private appointmentsEndpoint = inject(AppointmentsApiEndpoint);
  private customersEndpoint = inject(CustomerRegistrationsApiEndpoint);
  private vehiclesEndpoint = inject(VehiclesApiEndpoint);
  private coreApi = inject(CoreApi);

  appointmentForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  appointmentId = signal<string | null>(null);

  customers = signal<any[]>([]);
  vehicles = signal<any[]>([]);

  filteredCustomers!: Observable<any[]>;
  filteredVehicles!: Observable<any[]>;

  statuses = ['PENDING', 'COMPLETED', 'CANCELED'];

  ngOnInit(): void {
    this.initForm();
    this.loadCustomers();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.appointmentId.set(id);
      this.loadAppointment(id);
    }
  }

  initForm(): void {
    this.appointmentForm = this.fb.group({
      customerObj: ['', Validators.required],
      customerId: [''],
      vehicleObj: ['', Validators.required],
      vehicleId: [''],
      date: [null, Validators.required],
      time: ['', Validators.required],
      status: ['PENDING'],
      notes: ['']
    });

    this.filteredCustomers = this.appointmentForm.get('customerObj')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : this.getCustomerName(value);
        return name ? this._filterCustomers(name as string) : this.customers().slice();
      }),
    );

    this.filteredVehicles = this.appointmentForm.get('vehicleObj')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.plateNumber;
        return name ? this._filterVehicles(name as string) : this.vehicles().slice();
      }),
    );

    // When customer changes, load vehicles
    this.appointmentForm.get('customerObj')?.valueChanges.subscribe(selected => {
      if (typeof selected === 'object' && (selected?.customer?.id || selected?.customerId)) {
        const id = selected?.customer?.id || selected?.customerId;
        this.appointmentForm.patchValue({ customerId: id }, { emitEvent: false });
        this.loadVehicles(id);
      } else {
        this.appointmentForm.patchValue({ customerId: '' }, { emitEvent: false });
        this.vehicles.set([]);
      }
    });

    this.appointmentForm.get('vehicleObj')?.valueChanges.subscribe(selected => {
      if (typeof selected === 'object' && selected?.id) {
        this.appointmentForm.patchValue({ vehicleId: selected.id }, { emitEvent: false });
      } else {
        this.appointmentForm.patchValue({ vehicleId: '' }, { emitEvent: false });
      }
    });
  }

  displayCustomer = (reg: any): string => {
    return this.getCustomerName(reg);
  }

  getCustomerName(option: any): string {
    if (!option || !option.customer) return option?.customerId ? `Cliente ID: ${option.customerId}` : 'Cliente desconocido';
    if (option.customer.isCorporate) return option.customer.businessName || 'Empresa sin nombre';
    const name = `${option.customer.firstName || ''} ${option.customer.lastName || ''}`.trim();
    return name || 'Cliente sin nombre';
  }

  displayVehicle = (veh: any): string => {
    return veh ? veh.plateNumber : '';
  }

  private _filterCustomers(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.customers().filter(option => 
      this.getCustomerName(option).toLowerCase().includes(filterValue)
    );
  }

  private _filterVehicles(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.vehicles().filter(option => option.plateNumber.toLowerCase().includes(filterValue));
  }

  loadCustomers(): void {
    const branchId = localStorage.getItem('tenantBranchId') || sessionStorage.getItem('tenantBranchId') || '';
    if (!branchId) return;
    this.customersEndpoint.getByBranchId(branchId).subscribe({
      next: (registrations) => {
        const requests = registrations.map(r => 
          this.coreApi.customers.getById(r.customerId).pipe(
            map(c => ({ ...r, customer: c })),
            catchError(() => of(r))
          )
        );
        if (requests.length > 0) {
          forkJoin(requests).subscribe(data => {
            this.customers.set(data);
            this.appointmentForm.get('customerObj')?.updateValueAndValidity();
          });
        } else {
          this.customers.set([]);
        }
      },
      error: (err) => console.error(err)
    });
  }

  loadVehicles(customerId: string): void {
    this.vehiclesEndpoint.getByCustomerId(customerId).subscribe({
      next: (data) => {
        // [INJECTED MOCK FOR QUICK TESTING]
        if (!data || data.length === 0) {
          data = [{ 
            id: '123e4567-e89b-12d3-a456-426614174000', 
            plateNumber: 'TEST-123', 
            brand: 'Vehículo', 
            model: 'de Prueba', 
            year: 2026, 
            vin: '000000000' 
          }];
        }
        this.vehicles.set(data);
        this.appointmentForm.get('vehicleObj')?.updateValueAndValidity();
      },
      error: (err) => console.error(err)
    });
  }

  loadAppointment(id: string): void {
    this.isLoading.set(true);
    this.appointmentsEndpoint.getById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (appointment: AppointmentResource) => {
          const scheduled = new Date(appointment.scheduledStart);
          const timeStr = scheduled.toTimeString().substring(0, 5);

          // We don't have the full customer/vehicle objects easily available synchronously without a specific fetch.
          // For simplicity in UI, we'll patch the IDs and let the autocomplete show them if they type.
          // Since it's a dropdown, we will just patch the raw objects.
          
          this.appointmentForm.patchValue({
            customerId: appointment.customerId,
            vehicleId: appointment.vehicleId,
            date: scheduled,
            time: timeStr,
            status: appointment.status,
            notes: appointment.notes
          });
        },
        error: (err: any) => console.error('Error loading appointment', err)
      });
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid || !this.appointmentForm.value.customerId || !this.appointmentForm.value.vehicleId) {
      this.appointmentForm.markAllAsTouched();
      alert('Por favor selecciona un cliente y un vehículo válidos de la lista.');
      return;
    }

    const formValue = this.appointmentForm.value;
    const branchId = localStorage.getItem('tenantBranchId') || sessionStorage.getItem('tenantBranchId') || '';
    
    // date is a Date object from MatDatepicker
    let dateStr = '';
    if (typeof formValue.date === 'string') {
      dateStr = formValue.date.split('T')[0];
    } else {
      const d = formValue.date as Date;
      dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }
    const scheduledStart = `${dateStr}T${formValue.time}:00`;

    this.isSaving.set(true);

    if (this.isEditMode() && this.appointmentId()) {
      const command = new UpdateAppointmentCommand(
        branchId,
        formValue.customerId,
        formValue.vehicleId,
        scheduledStart,
        formValue.status,
        formValue.notes
      );
      this.appointmentsEndpoint.update(this.appointmentId()!, command)
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => this.router.navigate(['/fleet/appointments']),
          error: (err: any) => console.error('Error updating appointment', err)
        });
    } else {
      const command = new CreateAppointmentCommand(
        branchId,
        formValue.customerId,
        formValue.vehicleId,
        scheduledStart,
        formValue.notes
      );
      this.appointmentsEndpoint.create(command)
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => this.router.navigate(['/fleet/appointments']),
          error: (err: any) => console.error('Error creating appointment', err)
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/fleet/appointments']);
  }
}

