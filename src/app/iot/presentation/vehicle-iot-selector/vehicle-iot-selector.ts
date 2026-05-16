import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IotStore } from '../../application/iot.store';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matDirectionsCar, matLinkOff } from '@ng-icons/material-icons/baseline';
import { ObdDevice } from '../../domain/models/obd-device.entity';
import { MatButtonModule } from '@angular/material/button';

/**
 * Component that allows selecting a vehicle to view its iot.
 * Displays a list of vehicles with their linked OBD2 device status.
 */
@Component({
  selector: 'app-vehicle-iot-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgIcon, MatButtonModule],
  providers: [provideIcons({ matDirectionsCar, matLinkOff })],
  templateUrl: './vehicle-iot-selector.html',
  styleUrl: './vehicle-iot-selector.css'
})
export class VehicleIotSelector {
  private readonly store = inject(IotStore);

  readonly vehicleDevices = this.store.vehicleDevices;
  readonly selectedDevice = this.store.selectedDevice;

  /**
   * Handles vehicle selection by setting the active device.
   */
  onSelect(device: ObdDevice): void {
    this.store.selectDevice(device);
  }

  /**
   * Handles unlinking a device from a vehicle with a confirmation dialog.
   */
  onUnlink(event: MouseEvent, deviceId: string): void {
    event.stopPropagation();
    if (confirm('¿Estás seguro de que deseas desvincular este dispositivo?')) {
      this.store.unlinkDevice(deviceId);
    }
  }
}
