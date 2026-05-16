import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IotStore } from '../../application/iot.store';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  matSpeed, 
  matThermostat, 
  matLocalGasStation, 
  matSettingsInputComponent,
  matBolt,
  matTimeline
} from '@ng-icons/material-icons/baseline';

/**
 * Component that displays a grid of real-time iot metrics.
 */
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
  templateUrl: './metrics-grid.html',
  styleUrl: './metrics-grid.css'
})
export class MetricsGrid {
  private readonly store = inject(IotStore);
  /**
   * Most recent iot snapshot from the store.
   */
  readonly latestSnapshot = this.store.latestSnapshot;
}

