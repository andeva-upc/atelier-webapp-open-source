import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IotStore } from '../../../application/iot.store';
import { VehicleResource } from '../../../infrastructure/responses/vehicle.response';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-vehicle-dtc-alerts',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, TranslateModule],
  templateUrl: './vehicle-dtc-alerts.html',
  styleUrl: './vehicle-dtc-alerts.css',
})
export class VehicleDtcAlertsComponent implements OnInit {
  protected store = inject(IotStore);
  private route = inject(ActivatedRoute);

  vehicleId = '';

  selectedVehicle = computed<VehicleResource | null>(() => {
    return this.store.vehicles().find(v => v.id === this.vehicleId) || null;
  });

  ngOnInit(): void {
    this.vehicleId = this.route.snapshot.paramMap.get('id') || '';

    // Load vehicles if empty (e.g., refresh on this page)
    const customerId = localStorage.getItem('customerId') || '';
    if (this.store.vehicles().length === 0 && customerId) {
      this.store.loadVehiclesByCustomerId(customerId);
    }

    if (this.vehicleId) {
      this.store.loadVehicleDtcAlertHistory(this.vehicleId);
    }
  }
}
