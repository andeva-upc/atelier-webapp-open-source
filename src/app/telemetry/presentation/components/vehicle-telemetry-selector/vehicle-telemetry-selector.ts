import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TelemetryStore, VehicleTelemetry } from '../../../application/telemetry.store';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matDirectionsCar, matLinkOff } from '@ng-icons/material-icons/baseline';
import { ObdDevice } from '../../../domain/models/obd-device.entity';
import { MatButtonModule } from '@angular/material/button';

/**
 * Component that allows selecting a vehicle to view its telemetry.
 * Displays a list of vehicles with their linked OBD2 device status.
 */
@Component({
  selector: 'app-vehicle-telemetry-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgIcon, MatButtonModule],
  providers: [provideIcons({ matDirectionsCar, matLinkOff })],
  template: `
    <div class="selector-container">
      <h3 class="sidebar-title">{{ 'telemetry.vehicles.title' | translate }}</h3>
      
      <div class="vehicle-list">
        @for (item of vehicleDevices(); track item.vehicle.id) {
          <div 
            class="vehicle-item" 
            [class.active]="selectedDevice()?.id === item.device?.id"
            [class.disabled]="!item.device"
            (click)="item.device && onSelect(item.device)"
          >
            <div class="vehicle-icon">
              <ng-icon name="matDirectionsCar"></ng-icon>
            </div>
            
            <div class="vehicle-info">
              <span class="plate">{{ item.vehicle.plateNumber }}</span>
              <span class="model">{{ item.vehicle.getDisplayName() }}</span>
              
              @if (item.device) {
                <button 
                  mat-button 
                  color="warn" 
                  class="unlink-btn-mat"
                  (click)="onUnlink($event, item.device.id)"
                >
                   {{ 'telemetry.actions.unlink' | translate }}
                </button>
              }
            </div>

            <div class="vehicle-status">
              @if (item.device) {
                <span class="status-badge" [class]="item.status.toLowerCase()">
                  {{ 'telemetry.vehicles.active' | translate }}
                </span>
              } @else {
                <span class="status-badge unlinked">
                  {{ 'telemetry.vehicles.inactive' | translate }}
                </span>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .selector-container {
      background: white;
      border-radius: 1rem;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      font-family: 'Mona Sans', sans-serif;
    }
    .sidebar-title {
      padding: 1.5rem;
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: #1e293b;
      border-bottom: 1px solid #f1f5f9;
    }
    .vehicle-list {
      display: flex;
      flex-direction: column;
    }
    .vehicle-item {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      gap: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
      border-bottom: 1px solid #f1f5f9;
    }
    .vehicle-item:last-child {
      border-bottom: none;
    }
    .vehicle-item:hover:not(.disabled) {
      background-color: #f8fafc;
    }
    .vehicle-item.active {
      background-color: #f1f7ff;
      border-left: 4px solid #0071EB;
    }
    .vehicle-item.disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
    .vehicle-icon {
      width: 40px;
      height: 40px;
      background: #f1f5f9;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      font-size: 1.25rem;
    }
    .vehicle-item.active .vehicle-icon {
      background: #0071EB;
      color: white;
    }
    .vehicle-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .plate {
      font-weight: 700;
      color: #1e293b;
      font-size: 0.9rem;
      font-family: 'Arimo', sans-serif;
    }
    .model {
      color: #64748b;
      font-size: 0.8rem;
    }
    .unlink-btn-mat {
      height: 28px !important;
      line-height: 28px !important;
      padding: 0 8px !important;
      font-size: 0.75rem !important;
      margin-top: 4px !important;
      min-width: auto !important;
    }
    .vehicle-status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }
    .status-badge {
      font-size: 0.7rem;
      padding: 0.1rem 0.5rem;
      border-radius: 1rem;
      font-weight: 600;
      text-transform: capitalize;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
    .status-badge.active::before {
      content: '';
      width: 6px;
      height: 6px;
      background: #22c55e;
      border-radius: 50%;
    }
    .status-badge.active { color: #22c55e; background: #f0fdf4; }
    .status-badge.unlinked { color: #94a3b8; background: #f8fafc; }
    .status-badge.unlinked::before {
      content: '';
      width: 6px;
      height: 6px;
      background: #94a3b8;
      border-radius: 50%;
    }
  `]
})
export class VehicleTelemetrySelector {
  private readonly store = inject(TelemetryStore);

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
