import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TelemetryStore } from '../../../application/telemetry.store';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  matSpeed, 
  matThermostat, 
  matLocalGasStation, 
  matSettingsInputComponent,
  matBolt,
  matTimeline
} from '@ng-icons/material-icons/baseline';

@Component({
  selector: 'app-metrics-grid',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgIcon],
  providers: [
    provideIcons({ 
      matSpeed, 
      matThermostat, 
      matLocalGasStation, 
      matSettingsInputComponent,
      matBolt,
      matTimeline
    })
  ],
  template: `
    <div class="metrics-grid">
      @if (latestSnapshot(); as snapshot) {
        <!-- RPM -->
        <div class="metric-card">
          <div class="metric-icon rpm"><ng-icon name="matTimeline"></ng-icon></div>
          <div class="metric-content">
            <span class="label">{{ 'telemetry.metrics.rpm' | translate }}</span>
            <span class="value">{{ snapshot.rpm }}</span>
            <span class="unit">RPM</span>
          </div>
        </div>

        <!-- Temperature -->
        <div class="metric-card">
          <div class="metric-icon temp" [class.warning]="snapshot.temp > 100">
            <ng-icon name="matThermostat"></ng-icon>
          </div>
          <div class="metric-content">
            <span class="label">{{ 'telemetry.metrics.temp' | translate }}</span>
            <span class="value">{{ snapshot.temp }}</span>
            <span class="unit">°C</span>
          </div>
        </div>

        <!-- Fuel -->
        <div class="metric-card">
          <div class="metric-icon fuel" [class.critical]="snapshot.fuelLevelPercent < 15">
            <ng-icon name="matLocalGasStation"></ng-icon>
          </div>
          <div class="metric-content">
            <span class="label">{{ 'telemetry.metrics.fuel' | translate }}</span>
            <span class="value">{{ snapshot.fuelLevelPercent }}</span>
            <span class="unit">%</span>
          </div>
        </div>

        <!-- Speed -->
        <div class="metric-card">
          <div class="metric-icon speed"><ng-icon name="matSpeed"></ng-icon></div>
          <div class="metric-content">
            <span class="label">{{ 'telemetry.metrics.speed' | translate }}</span>
            <span class="value">{{ snapshot.speedKmh }}</span>
            <span class="unit">km/h</span>
          </div>
        </div>
      } @else {
        <div class="no-data">
          {{ 'telemetry.loading-records' | translate }}
        </div>
      }
    </div>
  `,
  styles: [`
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      font-family: 'Mona Sans', sans-serif;
    }
    .metric-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    .metric-icon.rpm { background: #eff6ff; color: #3b82f6; }
    .metric-icon.temp { background: #fff7ed; color: #f97316; }
    .metric-icon.temp.warning { background: #fef2f2; color: #ef4444; }
    .metric-icon.fuel { background: #f0fdf4; color: #22c55e; }
    .metric-icon.fuel.critical { background: #fef2f2; color: #ef4444; }
    .metric-icon.speed { background: #faf5ff; color: #a855f7; }

    .metric-content {
      display: flex;
      flex-direction: column;
    }
    .label {
      font-size: 0.8rem;
      color: #64748b;
      font-weight: 500;
    }
    .value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.2;
      font-family: 'Arimo', sans-serif;
    }
    .unit {
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 600;
    }
    .no-data {
      grid-column: 1 / -1;
      padding: 2rem;
      text-align: center;
      color: #94a3b8;
      background: white;
      border-radius: 1rem;
      border: 1px dashed #cbd5e1;
    }
  `]
})
export class MetricsGrid {
  private readonly store = inject(TelemetryStore);
  readonly latestSnapshot = this.store.latestSnapshot;
}
