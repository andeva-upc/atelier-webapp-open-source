import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IotStore } from '../../../application/iot.store';

@Component({
  selector: 'app-vehicle-plate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-plate.html'
})
export class VehiclePlateComponent implements OnInit {
  @Input({ required: true }) vehicleId!: string;
  private iotStore = inject(IotStore);

  plate = signal<string>('');
  loading = signal<boolean>(true);
  error = signal<boolean>(false);

  ngOnInit() {
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
