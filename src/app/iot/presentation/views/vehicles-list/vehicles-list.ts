import { Component, OnInit, computed, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { IotStore } from '../../../application/iot.store';
import { VehicleResource } from '../../../infrastructure/responses/vehicle.response';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-vehicles-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, TranslateModule],
  templateUrl: './vehicles-list.html',
  styleUrl: './vehicles-list.css',
})
export class VehiclesListComponent implements OnInit {
  private readonly customerId: string;

  searchQuery = signal<string>('');
  isModalOpen = signal<boolean>(false);
  selectedVehicle = signal<VehicleResource | null>(null);

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

  openModal(vehicle: VehicleResource): void {
    this.selectedVehicle.set(vehicle);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedVehicle.set(null);
  }

  viewTelemetry(): void {
    const v = this.selectedVehicle();
    if (v) {
      this.closeModal();
      this.router.navigate(['/vehicles', v.id, 'telemetry']);
    }
  }

  viewDtcAlerts(): void {
    const v = this.selectedVehicle();
    if (v) {
      this.closeModal();
      this.router.navigate(['/vehicles', v.id, 'dtc_alerts']);
    }
  }

  editVehicle(): void {
    const v = this.selectedVehicle();
    if (v) {
      this.closeModal();
      this.router.navigate(['/vehicles', v.id, 'edit']);
    }
  }

  deleteVehicle(): void {
    const v = this.selectedVehicle();
    if (!v) return;

    const confirmed = window.confirm(
      '¿Estás seguro de que deseas desregistrar este vehículo? Esta acción no se puede deshacer.'
    );
    if (!confirmed) return;
    
    this.isDeletingId.set(v.id);
    this.store.deleteVehicle(v.id);
    this.closeModal();
    // Give the store time to update then clear state
    setTimeout(() => this.isDeletingId.set(null), 500);
  }
}
