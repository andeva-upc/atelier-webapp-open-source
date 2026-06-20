import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CoreApi } from '../../../../core/infrastructure/core-api';
import { CoreStore } from '../../../../core/application/core.store';
import { FleetApi } from '../../../../fleet/infrastructure/fleet-api';
import { IotApi } from '../../../../iot/infrastructure/iot-api';
import { OperationsApi } from '../../../infrastructure/operations-api';
import { CreateWorkOrderCommand } from '../../../domain/model/commands/create-work-order.command';
import { UpdateWorkOrderDetailsCommand } from '../../../domain/model/commands/update-work-order-details.command';
import { CreateAppointmentCommand } from '../../../../fleet/domain/model/commands/create-appointment.command';

@Component({
  selector: 'app-work-order-form-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './work-order-form-view.html',
  styleUrl: './work-order-form-view.css'
})
export class WorkOrderFormViewComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private coreStore = inject(CoreStore);
  private coreApi = inject(CoreApi);
  private fleetApi = inject(FleetApi);
  private iotApi = inject(IotApi);
  private operationsApi = inject(OperationsApi);

  constructor() {
    // Reactively watch the active branch from the CoreStore signal.
    // This fires immediately if the branch is already loaded, OR later
    // when the async Owner→Workshop→Branch chain completes.
    effect(() => {
      const branch = this.coreStore.currentBranch();
      // Only load customers when not in edit mode (edit mode pre-loads them via the order data)
      if (branch?.id && !this.isEditMode()) {
        this.loadBranchCustomers(branch.id.toString());
      }
    });
  }

  orderId: string | null = null;

  // --- Modo Edición vs Creación ---
  isEditMode = signal<boolean>(false);

  // --- Campos del Formulario ---
  customerInput = signal<string>('');
  vehicleInput = signal<string>('');
  selectedCustomerId = signal<string>('');
  selectedVehicleId = signal<string>('');
  currentMileage = signal<number | null>(null);
  diagnosis = signal<string>('');
  selectedStatus = signal<string>('PENDING');

  // --- Estados de Dropdowns ---
  isCustomerDropdownOpen = signal<boolean>(false);
  isVehicleDropdownOpen = signal<boolean>(false);
  isStatusDropdownOpen = signal<boolean>(false);

  // --- Listas de Datos Reales del Backend ---
  customersList = signal<{ id: string, name: string }[]>([]);
  vehiclesList = signal<{ id: string, name: string }[]>([]);

  statusList = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'PAID'];

  // --- Filtros Reactivos ---
  filteredCustomers = computed(() => {
    const search = this.customerInput().toLowerCase().trim();
    const list = this.customersList();
    if (search === '') return list;
    return list.filter(c => c.name.toLowerCase().includes(search));
  });

  filteredVehicles = computed(() => {
    const search = this.vehicleInput().toLowerCase().trim();
    const list = this.vehiclesList();
    if (search === '') return list;
    return list.filter(v => v.name.toLowerCase().includes(search));
  });

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id');

    if (this.orderId) {
      this.isEditMode.set(true);
      this.loadOrderData(this.orderId);
    }
    // Note: customers are loaded reactively via the effect() in the constructor,
    // which watches coreStore.currentBranch() and fires as soon as a branch is available.
  }

  private loadBranchCustomers(branchId: string) {
    this.fleetApi.customerRegistrations.getByBranchId(branchId).subscribe({
      next: (registrations) => {
        const activeRegs = registrations.filter(r => r.status === 'ACTIVE');
        if (activeRegs.length === 0) {
          this.customersList.set([]);
          return;
        }

        const profileRequests = activeRegs.map(r => this.coreApi.customers.getById(r.customerId));
        forkJoin(profileRequests).subscribe({
          next: (profiles) => {
            const mapped = profiles.map(p => ({
              id: p.id,
              name: `${p.firstName} ${p.lastName}`
            }));
            this.customersList.set(mapped);
          },
          error: (err) => console.error('Failed to load customer profiles:', err)
        });
      },
      error: (err) => console.error('Failed to load customer registrations:', err)
    });
  }

  private loadOrderData(id: string) {
    this.operationsApi.workOrders.getById(id).subscribe({
      next: (order) => {
        this.diagnosis.set(order.diagnosticSummary || '');
        this.currentMileage.set(order.mileageIn || null);
        this.selectedStatus.set(order.status || 'PENDING');

        if (order.customerId) {
          this.selectedCustomerId.set(order.customerId);
          this.coreApi.customers.getById(order.customerId).subscribe({
            next: (c) => this.customerInput.set(`${c.firstName} ${c.lastName}`),
            error: (err) => console.error('Failed to load customer for order:', err)
          });

          this.iotApi.vehicles.getByCustomerId(order.customerId).subscribe({
            next: (vehicles) => {
              const mapped = vehicles.map(v => ({
                id: v.id,
                name: `${v.brand} ${v.model} (${v.plateNumber})`
              }));
              this.vehiclesList.set(mapped);

              // Encontrar el vehículo correspondiente
              const matched = mapped.find(v => v.id === order.vehicleId);
              if (matched) {
                this.vehicleInput.set(matched.name);
                this.selectedVehicleId.set(matched.id);
              }
            },
            error: (err) => console.error('Failed to load vehicles for order customer:', err)
          });
        }
      },
      error: (err) => console.error('Error loading work order:', err)
    });
  }

  private loadVehiclesForCustomer(customerId: string) {
    this.iotApi.vehicles.getByCustomerId(customerId).subscribe({
      next: (vehicles) => {
        const mapped = vehicles.map(v => ({
          id: v.id,
          name: `${v.brand} ${v.model} (${v.plateNumber})`
        }));
        this.vehiclesList.set(mapped);
      },
      error: (err) => console.error('Failed to load customer vehicles:', err)
    });
  }

  // --- Acciones de Selección ---
  selectCustomer(cust: { id: string, name: string }) {
    this.customerInput.set(cust.name);
    this.selectedCustomerId.set(cust.id);
    this.isCustomerDropdownOpen.set(false);

    // Limpiar selección de vehículo anterior
    this.vehicleInput.set('');
    this.selectedVehicleId.set('');
    this.vehiclesList.set([]);

    this.loadVehiclesForCustomer(cust.id);
  }

  selectVehicle(veh: { id: string, name: string }) {
    this.vehicleInput.set(veh.name);
    this.selectedVehicleId.set(veh.id);
    this.isVehicleDropdownOpen.set(false);
  }

  selectStatus(status: string) {
    this.selectedStatus.set(status);
    this.isStatusDropdownOpen.set(false);
  }

  // --- Guardar Cambios (Crear / Editar) ---
  saveWorkOrder() {
    // Prefer the reactive signal; fall back to localStorage as safety net
    const branchId = this.coreStore.currentBranch()?.id?.toString()
      || localStorage.getItem('tenantBranchId')
      || sessionStorage.getItem('tenantBranchId');
    if (!branchId) {
      alert('Error: No hay una sucursal activa. Por favor seleccioná una sucursal desde el menú superior antes de continuar.');
      return;
    }

    if (!this.selectedCustomerId() || !this.selectedVehicleId()) {
      alert('Error: Please select a valid Customer and Vehicle from the dropdowns.');
      return;
    }

    const mileage = this.currentMileage();
    if (mileage === null || mileage < 0) {
      alert('Error: Please enter a valid mileage.');
      return;
    }

    const diag = this.diagnosis().trim();
    if (diag.length < 5) {
      alert('Error: Diagnosis must be at least 5 characters long.');
      return;
    }

    if (this.isEditMode() && this.orderId) {
      // MODO EDICIÓN
      const updateCommand = new UpdateWorkOrderDetailsCommand(diag, mileage);
      this.operationsApi.workOrders.updateDetails(this.orderId, updateCommand).subscribe({
        next: (order) => {
          this.router.navigate(['/work-orders'], { queryParams: { expandedOrderId: order.id } }).then();
        },
        error: (err) => {
          console.error('Failed to update work order:', err);
          alert('Failed to update work order. Please check console for details.');
        }
      });
    } else {
      // MODO CREACIÓN
      // 1. Crear una cita Walk-in en el backend para obtener el appointmentId
      const now = new Date();
      const scheduledStart = now.toISOString().slice(0, 19); // yyyy-MM-ddTHH:mm:ss

      const appointmentCommand: CreateAppointmentCommand = {
        branchId: branchId,
        customerId: this.selectedCustomerId(),
        vehicleId: this.selectedVehicleId(),
        scheduledStart: scheduledStart,
        notes: 'Walk-in direct Work Order creation'
      };

      this.fleetApi.appointments.create(appointmentCommand).subscribe({
        next: (appointment) => {
          // 2. Crear la orden de trabajo con el appointmentId recibido
          const workOrderCommand = new CreateWorkOrderCommand(
            appointment.id,
            branchId,
            this.selectedVehicleId(),
            this.selectedCustomerId(),
            0, // internalNumber (será ignorado por el DTO y recalculado por el backend)
            diag,
            mileage
          );

          this.operationsApi.workOrders.create(workOrderCommand).subscribe({
            next: (order) => {
              this.router.navigate(['/work-orders'], { queryParams: { expandedOrderId: order.id } }).then();
            },
            error: (err) => {
              console.error('Failed to create work order:', err);
              alert('Failed to create work order. Please check console for details.');
            }
          });
        },
        error: (err) => {
          console.error('Failed to create appointment for work order:', err);
          alert('Failed to create background appointment for the work order.');
        }
      });
    }
  }

  onCustomerBlur() {
    setTimeout(() => this.isCustomerDropdownOpen.set(false), 200);
  }

  onVehicleBlur() {
    setTimeout(() => this.isVehicleDropdownOpen.set(false), 200);
  }
}
