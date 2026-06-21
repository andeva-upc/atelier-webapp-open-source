import { Component, OnInit, computed, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { IotStore } from '../../../application/iot.store';
import { VehicleResource } from '../../../infrastructure/responses/vehicle.response';

@Component({
  selector: 'app-vehicles-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './vehicles-list.html',
  styleUrl: './vehicles-list.css',
})
export class VehiclesListComponent implements OnInit {
  private readonly customerId: string;

  searchQuery = signal<string>('');

  readonly filteredVehicles = computed<VehicleResource[]>(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const list = this.store.vehicles();
    if (!q) return list;
    return list.filter(
      (v) =>
        v.brand.toLowerCase().includes(q) ||
        v.plateNumber.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q)
    );
  });

  isDeletingId = signal<string | null>(null);

  constructor(public store: IotStore, private router: Router) {
    this.customerId = localStorage.getItem('customerId') || '';
  }

  ngOnInit(): void {
    if (this.customerId) {
      this.store.loadVehiclesByCustomerId(this.customerId);
    }
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  viewTelemetry(vehicleId: string): void {
    this.router.navigate(['/vehicles', vehicleId, 'telemetry']);
  }

  editVehicle(vehicleId: string): void {
    this.router.navigate(['/vehicles', vehicleId, 'edit']);
  }

  deleteVehicle(vehicleId: string): void {
    const confirmed = window.confirm(
      '¿Estás seguro de que deseas eliminar este vehículo? Esta acción no se puede deshacer.'
    );
    if (!confirmed) return;
    this.isDeletingId.set(vehicleId);
    this.store.deleteVehicle(vehicleId);
    // Give the store time to update then clear state
    setTimeout(() => this.isDeletingId.set(null), 500);
  }
}
