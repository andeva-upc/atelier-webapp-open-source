import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TelemetryStore } from '../../application/telemetry.store';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matLink } from '@ng-icons/material-icons/baseline';

/**
 * Main dashboard view for Telemetry.
 * Orchestrates the display of real-time metrics, historical charts, and active alerts.
 */
@Component({
  selector: 'app-telemetry-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgIcon
  ],
  providers: [
    provideIcons({ matLink })
  ],
  templateUrl: './telemetry-dashboard.html',
  styleUrl: './telemetry-dashboard.css'
})
export class TelemetryDashboard implements OnInit {
  private readonly store = inject(TelemetryStore);

  /** Signal indicating global loading state */
  readonly isLoading = this.store.loading;

  /** Signal for the currently selected device */
  readonly selectedDevice = this.store.selectedDevice;

  /**
   * Initializes the view by loading available telemetry devices.
   */
  ngOnInit(): void {
    this.store.loadDevices();
  }
}
