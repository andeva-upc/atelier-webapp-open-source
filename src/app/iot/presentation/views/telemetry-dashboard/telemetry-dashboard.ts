import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IotStore } from '../../../application/iot.store';
import { Obd2DialogComponent } from '../../components/obd2-dialog/obd2-dialog';
import { LinkDialogComponent } from '../../components/link-dialog/link-dialog';
import { VehicleResource } from '../../../infrastructure/responses/vehicle.response';
import { Obd2DeviceRegistrationResource } from '../../../infrastructure/responses/obd2-registration.response';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-telemetry-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    Obd2DialogComponent,
    LinkDialogComponent,
    RouterLink
  ],
  templateUrl: './telemetry-dashboard.html',
  styleUrl: './telemetry-dashboard.css'
})
export class TelemetryDashboardComponent implements OnInit {
  protected store = inject(IotStore);

  isCustomer = false;
  branchId = '';
  customerId = '';

  // UI state
  selectedVehicleId = signal<string>('');
  isObd2DialogOpen = false;
  isLinkDialogOpen = false;

  // Selected vehicle details
  selectedVehicle = computed<VehicleResource | null>(() => {
    const list = this.isCustomer ? this.store.vehicles() : this.store.branchVehicles();
    return list.find(v => v.id === this.selectedVehicleId()) || null;
  });

  // Selected vehicle registration/coupling (Workshop only)
  activeCoupling = computed<Obd2DeviceRegistrationResource | null>(() => {
    if (this.isCustomer) return null;
    return this.store.registrations().find(r => r.vehicleId === this.selectedVehicleId() && r.status === 'ACTIVE') || null;
  });

  // Selected vehicle OBD2 device details (Workshop only)
  activeObd2Device = computed(() => {
    const coupling = this.activeCoupling();
    if (!coupling) return null;
    return this.store.obd2Devices().find(d => d.id === coupling.obd2DeviceId) || null;
  });

  // Latest snapshot metrics computed dynamically
  latestSnapshot = computed(() => {
    const snapshots = this.store.telemetrySnapshots();
    return snapshots.length > 0 ? snapshots[0] : null;
  });

  constructor() {
    // Reload telemetry and DTCs when selected vehicle or coupling changes
    effect(() => {
      const vehicleId = this.selectedVehicleId();
      if (!vehicleId) {
        return;
      }

      if (this.isCustomer) {
        this.store.loadVehicleTelemetryHistory(vehicleId);
        this.store.loadVehicleDtcAlertHistory(vehicleId);
      } else {
        const coupling = this.activeCoupling();
        if (coupling) {
          this.store.loadTelemetrySnapshotsForRegistration(coupling.id);
          this.store.loadDtcAlertsForRegistration(coupling.id);
        } else {
          // Clear signals if not linked
          // We can do this by loading empty or letting store load with invalid/empty
          // In this case, we just rely on store signals being empty because no load was triggered
        }
      }
    });
  }

  ngOnInit(): void {
    const activeRole = localStorage.getItem('activeRole') || '';
    this.isCustomer = activeRole.includes('CUSTOMER');
    this.branchId = localStorage.getItem('tenantBranchId') || '';
    this.customerId = localStorage.getItem('customerId') || '';

    if (this.isCustomer) {
      if (this.customerId) {
        this.store.loadVehiclesByCustomerId(this.customerId);
      }
    } else {
      if (this.branchId) {
        this.store.loadRegistrations(this.branchId, 'ACTIVE');
        this.store.loadBranchVehicles(this.branchId);
        this.store.loadObd2Devices(this.branchId);
      }
    }

    // Auto-select first vehicle once loaded
    effect(() => {
      const list = this.isCustomer ? this.store.vehicles() : this.store.branchVehicles();
      if (list.length > 0 && !this.selectedVehicleId()) {
        this.selectedVehicleId.set(list[0].id);
      }
    });
  }

  onVehicleChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedVehicleId.set(select.value);
  }

  unlinkObd2(): void {
    const coupling = this.activeCoupling();
    if (coupling && confirm('¿Estás seguro de que deseas desvincular el dispositivo OBD2 de este vehículo?')) {
      this.store.deactivateRegistration(coupling.id);
    }
  }

  openObd2Dialog(): void {
    this.isObd2DialogOpen = true;
  }

  closeObd2Dialog(): void {
    this.isObd2DialogOpen = false;
  }

  openLinkDialog(): void {
    this.isLinkDialogOpen = true;
  }

  closeLinkDialog(): void {
    this.isLinkDialogOpen = false;
  }
}
