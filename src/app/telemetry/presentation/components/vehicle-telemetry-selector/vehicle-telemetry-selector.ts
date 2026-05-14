import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TelemetryStore, VehicleTelemetry } from '../../../application/telemetry.store';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matDirectionsCar, matLinkOff } from '@ng-icons/material-icons/baseline';
import { ObdDevice } from '../../../domain/models/obd-device.entity';

@Component({
  selector: 'app-vehicle-telemetry-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgIcon],
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
            </div>

            <div class="vehicle-status">
              @if (item.device) {
                <span class="status-badge" [class]="item.status.toLowerCase()">
                  {{ 'telemetry.vehicles.active' | translate }}
                </span>
                <a class="unlink-btn" (click)="$event.stopPropagation()">
                   {{ 'telemetry.actions.unlink' | translate }}
                </a>
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
      border-left: 4px solid #0066ff;
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
      background: #0066ff;
      color: white;
    }
    .vehicle-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .plate {
      font-weight: 700;
      color: #1e293b;
      font-size: 0.9rem;
    }
    .model {
      color: #64748b;
      font-size: 0.8rem;
    }
    .vehicle-status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }
    .status-badge {
      font-size: 0.7rem;
      padding: 0.1rem 0.4rem;
      border-radius: 1rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-badge.active { background: #dcfce7; color: #166534; }
    .status-badge.unlinked { background: #f1f5f9; color: #64748b; }
    .unlink-btn {
      font-size: 0.7rem;
      color: #ef4444;
      text-decoration: underline;
    }
  `]
})
export class VehicleTelemetrySelector {
  private readonly store = inject(TelemetryStore);

  readonly vehicleDevices = this.store.vehicleDevices;
  readonly selectedDevice = this.store.selectedDevice;

  onSelect(device: ObdDevice): void {
    this.store.selectDevice(device);
  }
}
