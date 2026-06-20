import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IotStore } from '../../../application/iot.store';


@Component({
  selector: 'app-obd2-devices-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterLink
  ],
  templateUrl: './obd2-devices-list.html',
  styleUrl: './obd2-devices-list.css'
})
export class Obd2DevicesListComponent implements OnInit {
  protected store = inject(IotStore);
  private router = inject(Router);

  branchId = '';

  // Compute the list of OBD2 devices with linked vehicle details and active registration IDs
  devicesWithCoupling = computed(() => {
    const devices = this.store.obd2Devices();
    const regs = this.store.registrations();
    const vehicles = this.store.branchVehicles();

    return devices.map(d => {
      // Find active registration/coupling for this device
      const reg = regs.find(r => r.obd2DeviceId === d.id && r.status === 'ACTIVE');
      // Find associated vehicle
      const vehicle = reg ? vehicles.find(v => v.id === reg.vehicleId) : null;
      return {
        ...d,
        activeRegId: reg?.id || null,
        linkedVehicle: vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.plateNumber})` : null
      };
    });
  });

  ngOnInit(): void {
    this.branchId = localStorage.getItem('tenantBranchId') || '';
    if (this.branchId) {
      this.store.loadObd2Devices(this.branchId);
      this.store.loadRegistrations(this.branchId, 'ACTIVE');
      this.store.loadBranchVehicles(this.branchId);
    }
  }



  unlinkDevice(regId: string): void {
    if (confirm('¿Estás seguro de que deseas desvincular este dispositivo OBD2 de su vehículo?')) {
      this.store.deactivateRegistration(regId).subscribe({
        next: () => {
          if (this.branchId) {
            this.store.loadObd2Devices(this.branchId);
            this.store.loadRegistrations(this.branchId, 'ACTIVE');
          }
        },
        error: (err) => {
          console.error('Failed to deactivate registration:', err);
          alert('Error al desvincular el dispositivo.');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/telemetry']);
  }
}
