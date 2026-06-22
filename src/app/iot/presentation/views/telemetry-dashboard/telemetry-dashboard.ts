import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IotStore } from '../../../application/iot.store';
import { Obd2DialogComponent } from '../../components/obd2-dialog/obd2-dialog';
import { IngestTelemetryCommand } from '../../../domain/model/commands/ingest-telemetry.command';

import { VehicleResource } from '../../../infrastructure/responses/vehicle.response';
import { Obd2DeviceRegistrationResource } from '../../../infrastructure/responses/obd2-registration.response';

import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-telemetry-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    Obd2DialogComponent,
    RouterLink
  ],
  templateUrl: './telemetry-dashboard.html',
  styleUrl: './telemetry-dashboard.css'
})
export class TelemetryDashboardComponent implements OnInit {
  protected store = inject(IotStore);
  private route = inject(ActivatedRoute);

  isCustomer = false;
  branchId = '';
  customerId = '';

  // UI state
  selectedVehicleId = signal<string>('');
  isObd2DialogOpen = false;
  /** True when this component is loaded as /vehicles/:id/telemetry */
  isVehicleRoute = false;

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
    const activeRole = localStorage.getItem('activeRole') || '';
    this.isCustomer = activeRole.includes('CUSTOMER');
    this.branchId = localStorage.getItem('tenantBranchId') || '';
    this.customerId = localStorage.getItem('customerId') || '';

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
        }
      }
    });

    // Auto-select first vehicle once loaded
    effect(() => {
      const list = this.isCustomer ? this.store.vehicles() : this.store.branchVehicles();
      if (list.length > 0 && !this.selectedVehicleId()) {
        this.selectedVehicleId.set(list[0].id);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    // Check if we're in the /vehicles/:id/telemetry sub-route
    const routeVehicleId = this.route.snapshot.paramMap.get('id');
    if (routeVehicleId) {
      this.isVehicleRoute = true;
      this.selectedVehicleId.set(routeVehicleId);
    }

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

  // ── Manual Telemetry Ingestion ──
  showTelemetryModal = false;
  isIngesting = false;
  ingestSuccess = false;
  ingestError = '';

  private fb = inject(FormBuilder);

  telemetryForm = this.fb.group({
    rpm:              [2000, [Validators.required, Validators.min(0), Validators.max(9000)]],
    temperature:      [90,   [Validators.required, Validators.min(-40), Validators.max(200)]],
    speedKmh:         [60,   [Validators.min(0), Validators.max(400)]],
    odometerKm:       [null as number | null],
    fuelLevelPercent: [75.0, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  openTelemetryModal(): void {
    this.showTelemetryModal = true;
    this.ingestSuccess = false;
    this.ingestError = '';
    this.telemetryForm.reset({
      rpm: 2000, temperature: 90, speedKmh: 60, odometerKm: null, fuelLevelPercent: 75.0
    });
  }

  closeTelemetryModal(): void {
    this.showTelemetryModal = false;
  }

  submitTelemetry(): void {
    if (this.telemetryForm.invalid || this.isIngesting) return;
    const coupling = this.activeCoupling();
    if (!coupling) return;

    this.isIngesting = true;
    this.ingestError = '';
    const v = this.telemetryForm.value;

    const command = new IngestTelemetryCommand(
      coupling.obd2DeviceId,
      [{
        rpm:              v.rpm!,
        temperature:      v.temperature!,
        speedKmh:         v.speedKmh ?? undefined,
        odometerKm:       v.odometerKm ?? undefined,
        fuelLevelPercent: v.fuelLevelPercent!,
        createdAt:        new Date().toISOString()
      }]
    );

    this.store.ingestTelemetry(command);

    // Reload data after a short delay
    setTimeout(() => {
      if (coupling) {
        this.store.loadTelemetrySnapshotsForRegistration(coupling.id);
        this.store.loadDtcAlertsForRegistration(coupling.id);
      }
      this.isIngesting = false;
      this.ingestSuccess = true;
    }, 800);
  }

  isCreatingTestVehicle = false;
  createTestVehicle(): void {
    if (this.isCreatingTestVehicle) return;
    this.isCreatingTestVehicle = true;
    this.store.createTestVehicleForBranch(this.branchId).subscribe({
      next: (res) => {
        this.isCreatingTestVehicle = false;
        // In the backend response, it could be a VehicleRegistration or the vehicle object.
        // Let's get vehicles from the store to find the newly registered one
        setTimeout(() => {
          const list = this.isCustomer ? this.store.vehicles() : this.store.branchVehicles();
          if (list.length > 0) {
            this.selectedVehicleId.set(list[list.length - 1].id);
          }
        }, 1000);
      },
      error: (err) => {
        this.isCreatingTestVehicle = false;
        console.error('Failed to create test vehicle:', err);
        alert('Error al registrar vehículo de prueba.');
      }
    });
  }
}

