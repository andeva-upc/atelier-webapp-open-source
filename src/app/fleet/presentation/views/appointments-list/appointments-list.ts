import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AppointmentsApiEndpoint } from '../../../infrastructure/endpoints/appointments.endpoint';
import { AppointmentResource } from '../../../infrastructure/responses/appointment.response';
import { VehiclesApiEndpoint } from '../../../../iot/infrastructure/endpoints/vehicles.endpoint';
import { CoreApi } from '../../../../core/infrastructure/core-api';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './appointments-list.html',
  styleUrls: ['./appointments-list.css']
})
export class AppointmentsListComponent implements OnInit {
  private appointmentsEndpoint = inject(AppointmentsApiEndpoint);
  private vehiclesEndpoint = inject(VehiclesApiEndpoint);
  private coreApi = inject(CoreApi);
  private router = inject(Router);

  // State
  appointments = signal<AppointmentResource[]>([]);
  isLoading = signal<boolean>(false);
  
  customersMap = signal<Map<string, any>>(new Map());
  vehiclesMap = signal<Map<string, any>>(new Map());

  // Filters
  searchQuery = signal<string>('');
  selectedStatus = signal<string>('');
  statuses = ['PENDING', 'COMPLETED', 'CANCELED'];

  // Computed
  filteredAppointments = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const status = this.selectedStatus();

    return this.appointments().filter(a => {
      const customerName = this.getCustomerDisplay(a.customerId).toLowerCase();
      const vehiclePlate = this.getVehicleDisplay(a.vehicleId).toLowerCase();
      const matchesSearch = query ? (
        a.customerId.toLowerCase().includes(query) || 
        a.vehicleId.toLowerCase().includes(query) ||
        customerName.includes(query) ||
        vehiclePlate.includes(query)
      ) : true;
      const matchesStatus = status ? a.status === status : true;
      return matchesSearch && matchesStatus;
    });
  });

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    const branchId = localStorage.getItem('tenantBranchId') || sessionStorage.getItem('tenantBranchId');
    if (!branchId) return;

    this.isLoading.set(true);
    this.appointmentsEndpoint.getByBranchId(branchId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.appointments.set(data);
          this.resolveDetails(data);
        },
        error: (err) => console.error('Error loading appointments', err)
      });
  }

  resolveDetails(appointments: AppointmentResource[]): void {
    const customerIds = Array.from(new Set(appointments.map(a => a.customerId)));
    const vehicleIds = Array.from(new Set(appointments.map(a => a.vehicleId)));

    customerIds.forEach(id => {
      if (!this.customersMap().has(id)) {
        this.coreApi.customers.getById(id).subscribe({
          next: (c) => {
            const map = new Map(this.customersMap());
            map.set(id, c);
            this.customersMap.set(map);
          },
          error: () => {
            const map = new Map(this.customersMap());
            map.set(id, { firstName: 'Cliente', lastName: 'ID: ' + id.substring(0, 8) });
            this.customersMap.set(map);
          }
        });
      }
    });

    vehicleIds.forEach(id => {
      if (!this.vehiclesMap().has(id)) {
        this.vehiclesEndpoint.getById(id).subscribe({
          next: (v) => {
            const map = new Map(this.vehiclesMap());
            map.set(id, v);
            this.vehiclesMap.set(map);
          },
          error: () => {
            const map = new Map(this.vehiclesMap());
            map.set(id, { plateNumber: 'Vehículo ID: ' + id.substring(0, 8) });
            this.vehiclesMap.set(map);
          }
        });
      }
    });
  }

  getCustomerDisplay(customerId: string): string {
    const customer = this.customersMap().get(customerId);
    if (!customer) return 'Cargando cliente...';
    if (customer.isCorporate) return customer.businessName || 'Empresa sin nombre';
    const name = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    return name || 'Cliente sin nombre';
  }

  getVehicleDisplay(vehicleId: string): string {
    const vehicle = this.vehiclesMap().get(vehicleId);
    if (!vehicle) return 'Cargando vehículo...';
    return vehicle.brand && vehicle.model ? `${vehicle.plateNumber} - ${vehicle.brand} ${vehicle.model}` : vehicle.plateNumber;
  }

  onAddAppointment(): void {
    this.router.navigate(['/fleet/appointments/new']);
  }

  onEdit(appointment: AppointmentResource): void {
    this.router.navigate(['/fleet/appointments', appointment.id, 'edit']);
  }
}
