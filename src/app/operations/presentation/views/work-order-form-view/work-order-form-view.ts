import { Component, signal, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

import { CoreStore } from '../../../../core/application/core.store';
import { OperationsStore } from '../../../application/operations.store';
import { CreateWorkOrderCommand } from '../../../domain/model/commands/create-work-order.command';
import { UpdateWorkOrderDetailsCommand } from '../../../domain/model/commands/update-work-order-details.command';

import { AppointmentSelectorComponent } from '../../../../fleet/presentation/components/appointment-selector/appointment-selector';
import { CustomerNameComponent } from '../../../../core/presentation/components/customer-name/customer-name';
import { VehiclePlateComponent } from '../../../../iot/presentation/components/vehicle-plate/vehicle-plate';

@Component({
  selector: 'app-work-order-form-view',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    AppointmentSelectorComponent,
    CustomerNameComponent,
    VehiclePlateComponent
  ],
  templateUrl: './work-order-form-view.html',
  styleUrl: './work-order-form-view.css'
})
export class WorkOrderFormViewComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private coreStore = inject(CoreStore);
  private operationsStore = inject(OperationsStore);

  branchId = signal<string | null>(null);
  orderId: string | null = null;
  isEditMode = signal<boolean>(false);

  selectedAppointmentId = signal<string>('');
  selectedCustomerId = signal<string>('');
  selectedVehicleId = signal<string>('');
  
  currentMileage = signal<number | null>(null);
  diagnosis = signal<string>('');
  selectedStatus = signal<string>('PENDING');

  constructor() {
    effect(() => {
      const branch = this.coreStore.currentBranch();
      if (branch?.id) {
        this.branchId.set(branch.id.toString());
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id');

    if (this.orderId) {
      this.isEditMode.set(true);
      this.loadOrderData(this.orderId);
    }
  }

  private loadOrderData(id: string) {
    this.operationsStore.getWorkOrderByIdObservable(id).subscribe({
      next: (order) => {
        this.diagnosis.set(order.diagnosticSummary || '');
        this.currentMileage.set(order.mileageIn || null);
        this.selectedStatus.set(order.status || 'PENDING');

        // We can't change appointment in edit mode typically, but we display customer/vehicle.
        if (order.customerId) {
          this.selectedCustomerId.set(order.customerId);
        }
        if (order.vehicleId) {
          this.selectedVehicleId.set(order.vehicleId);
        }
      },
      error: (err) => console.error('Error loading work order:', err)
    });
  }

  onAppointmentSelected(data: {id: string, customerId: string, vehicleId: string}) {
    this.selectedAppointmentId.set(data.id);
    this.selectedCustomerId.set(data.customerId);
    this.selectedVehicleId.set(data.vehicleId);
  }

  saveWorkOrder() {
    const branchId = this.branchId();
    if (!branchId) {
      alert('Error: No hay una sucursal activa. Por favor seleccioná una sucursal desde el menú superior antes de continuar.');
      return;
    }

    if (!this.isEditMode() && !this.selectedAppointmentId()) {
      alert('Error: Please select an Appointment for the work order.');
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
      this.operationsStore.updateWorkOrderDetails(this.orderId, updateCommand, this.router);
    } else {
      // MODO CREACIÓN
      const workOrderCommand = new CreateWorkOrderCommand(
        this.selectedAppointmentId(),
        branchId,
        this.selectedVehicleId(),
        this.selectedCustomerId(),
        diag,
        mileage
      );

      this.operationsStore.createWorkOrder(workOrderCommand, this.router);
    }
  }
}
