import { Component, Input, OnInit, OnChanges, SimpleChanges, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IotStore } from '../../../application/iot.store';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-vehicle-plate',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './vehicle-plate.html'
})
export class VehiclePlateComponent implements OnInit, OnChanges {
  @Input({ required: true }) vehicleId!: string;
  private iotStore = inject(IotStore);

  plate = signal<string>('');
  loading = signal<boolean>(true);
  error = signal<boolean>(false);

  ngOnInit() {
    this.fetchVehicle();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['vehicleId'] && !changes['vehicleId'].isFirstChange()) {
      this.fetchVehicle();
    }
  }

  private fetchVehicle() {
    if (!this.vehicleId) return;

    this.loading.set(true);
    this.error.set(false);

    this.iotStore.getVehicleByIdObservable(this.vehicleId).subscribe({
      next: (vehicle: any) => {
        this.plate.set(vehicle.plateNumber);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }
}

