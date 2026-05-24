import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';


import { Appointment, AppointmentStatus } from '../../../domain/models/appointments.entity';
import {environment} from '../../../../../environments/environment';

interface AppointmentFormValue {
  customerId: string;
  customerPhone: string;
  vehicleId: string;
  serviceType: string;
  date: string;
  time: string;
  mechanicName: string;
  notes: string;
  status: AppointmentStatus;
}

interface UserRaw {
  id: string;
  email: string;
  phone?: string;
  deleted_at?: string | null;
}

interface CustomerProfileRaw {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  is_corporate?: boolean;
  business_name?: string;
  deleted_at?: string | null;
}

interface VehicleRaw {
  id: string;
  user_id: string;
  vehicle_model_id: string;
  plate_number: string;
  year?: number;
  deleted_at?: string | null;
}

interface VehicleModelRaw {
  id: string;
  brand: string;
  model: string;
}

interface BranchRaw {
  id: string;
  workshop_id: string;
  branch_name?: string;
  deleted_at?: string | null;
}

interface CustomerOption {
  id: string;
  userId: string;
  name: string;
  phone: string;
}

interface VehicleOption {
  id: string;
  userId: string;
  summary: string;
}

/**
 * Form component used for creating and editing workshop appointments.
 */
@Component({
  selector: 'app-appointments-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './appointments-form.html',
  styleUrl: './appointments-form.css',
})
export class AppointmentsForm implements OnInit, OnChanges {
  private readonly http = inject(HttpClient);

  @Input() appointment: Appointment | null = null;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() saving = false;

  @Output() readonly save = new EventEmitter<Appointment>();
  @Output() readonly cancel = new EventEmitter<void>();

  readonly customers = signal<CustomerOption[]>([]);
  readonly vehicles = signal<VehicleOption[]>([]);
  readonly selectedCustomerId = signal<string>('');
  readonly selectedBranch = signal<BranchRaw | null>(null);

  readonly availableVehicles = computed(() => {
    const customerId = this.selectedCustomerId();
    const customer = this.customers().find(item => item.id === customerId);

    if (!customer) {
      return [];
    }

    return this.vehicles().filter(vehicle => vehicle.userId === customer.userId);
  });

  readonly appointmentForm = new FormGroup({
    customerId: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    customerPhone: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    vehicleId: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    serviceType: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    date: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    time: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    mechanicName: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    notes: new FormControl<string>('', {
      nonNullable: true,
    }),
    status: new FormControl<AppointmentStatus>('SCHEDULED', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  ngOnInit(): void {
    this.loadFormOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appointment'] || changes['mode']) {
      this.patchForm();
    }
  }

  onCustomerChange(): void {
    const customerId = this.appointmentForm.controls.customerId.value;
    const customer = this.customers().find(item => item.id === customerId);

    this.selectedCustomerId.set(customerId);
    this.appointmentForm.controls.customerPhone.setValue(customer?.phone ?? '');
    this.appointmentForm.controls.vehicleId.setValue('');
  }

  onVehicleChange(): void {
    const vehicleId = this.appointmentForm.controls.vehicleId.value;
    const vehicle = this.vehicles().find(item => item.id === vehicleId);

    if (!vehicle) {
      this.appointmentForm.controls.vehicleId.setValue('');
    }
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid || this.saving) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    const value = this.appointmentForm.getRawValue() as AppointmentFormValue;
    const customer = this.customers().find(item => item.id === value.customerId);
    const vehicle = this.vehicles().find(item => item.id === value.vehicleId);

    if (!customer || !vehicle) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    const appointmentDate = `${value.date}T${value.time}:00`;

    const entity = new Appointment(
      this.appointment?.id ?? crypto.randomUUID(),
      this.appointment?.workshopId ?? this.selectedBranch()?.workshop_id ?? 'e2667890-7890-466d-7890-ca7f62d1c9ef',
      this.appointment?.branchId ?? this.selectedBranch()?.id ?? 'e2667890-7890-466d-7890-ca7f62d12345',
      appointmentDate,
      value.status,
      customer.name,
      customer.phone,
      vehicle.summary,
      value.serviceType,
      value.mechanicName,
      value.notes,
      this.appointment ? this.appointment.version + 1 : 0,
      customer.id,
      vehicle.id,
      this.appointment?.deletedAt
    );

    this.save.emit(entity);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private loadFormOptions(): void {
    const usersUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderUsersEndpointPath}`;
    const customerProfilesUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderCustomerProfilesEndpointPath}`;
    const vehiclesUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderVehiclesEndpointPath}`;
    const vehicleModelsUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderVehicleModelsEndpointPath}`;
    const branchesUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderBranchesEndpointPath}`;

    forkJoin({
      users: this.http.get<UserRaw[]>(usersUrl),
      customerProfiles: this.http.get<CustomerProfileRaw[]>(customerProfilesUrl),
      vehicles: this.http.get<VehicleRaw[]>(vehiclesUrl),
      vehicleModels: this.http.get<VehicleModelRaw[]>(vehicleModelsUrl),
      branches: this.http.get<BranchRaw[]>(branchesUrl),
    }).subscribe({
      next: ({ users, customerProfiles, vehicles, vehicleModels, branches }) => {
        const userById = new Map(
          users
            .filter(user => !user.deleted_at)
            .map(user => [user.id, user])
        );

        const modelById = new Map(
          vehicleModels.map(model => [model.id, model])
        );

        const customerOptions = customerProfiles
          .filter(customer => !customer.deleted_at)
          .map(customer => {
            const user = userById.get(customer.user_id);
            const name = customer.is_corporate && customer.business_name
              ? customer.business_name
              : `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim();

            return {
              id: customer.id,
              userId: customer.user_id,
              name: name || 'Cliente sin nombre',
              phone: user?.phone ?? 'Sin teléfono',
            };
          });

        const vehicleOptions = vehicles
          .filter(vehicle => !vehicle.deleted_at)
          .map(vehicle => {
            const model = modelById.get(vehicle.vehicle_model_id);

            return {
              id: vehicle.id,
              userId: vehicle.user_id,
              summary: `${model?.brand ?? 'Marca'} ${model?.model ?? 'Modelo'} - ${vehicle.plate_number}`,
            };
          });

        this.customers.set(customerOptions);
        this.vehicles.set(vehicleOptions);
        this.selectedBranch.set(branches.find(branch => !branch.deleted_at) ?? null);
        this.patchForm();
      },
      error: () => {
        this.customers.set([]);
        this.vehicles.set([]);
      },
    });
  }

  private patchForm(): void {
    if (!this.appointment) {
      this.selectedCustomerId.set('');

      this.appointmentForm.reset({
        customerId: '',
        customerPhone: '',
        vehicleId: '',
        serviceType: '',
        date: '',
        time: '',
        mechanicName: '',
        notes: '',
        status: 'SCHEDULED',
      });

      return;
    }

    this.selectedCustomerId.set(this.appointment.customerId ?? '');

    this.appointmentForm.patchValue({
      customerId: this.appointment.customerId ?? '',
      customerPhone: this.appointment.customerPhone,
      vehicleId: this.appointment.vehicleId ?? '',
      serviceType: this.appointment.serviceType,
      date: this.appointment.getDateLabel(),
      time: this.appointment.getTimeLabel(),
      mechanicName: this.appointment.mechanicName,
      notes: this.appointment.notes,
      status: this.appointment.status,
    });
  }
}
