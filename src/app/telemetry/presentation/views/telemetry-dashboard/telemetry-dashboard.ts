import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TelemetryStore } from '../../../application/telemetry.store';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matLink } from '@ng-icons/material-icons/baseline';
import { VehicleTelemetrySelector } from '../../components/vehicle-telemetry-selector/vehicle-telemetry-selector';
import { MetricsGrid } from '../../components/metrics-grid/metrics-grid';
import { DtcAlertsList } from '../../components/dtc-alerts-list/dtc-alerts-list';
import { HistoryChart } from '../../components/history-chart/history-chart';

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
    NgIcon,
    VehicleTelemetrySelector,
    MetricsGrid,
    DtcAlertsList,
    HistoryChart
  ],
  providers: [
    provideIcons({ matLink })
  ],
  templateUrl: './telemetry-dashboard.html',
  styleUrl: './telemetry-dashboard.css'
})
export class TelemetryDashboard implements OnInit {
  private readonly store = inject(TelemetryStore);
  private readonly translate = inject(TranslateService);

  /** Signal indicating global loading state */
  readonly isLoading = this.store.loading;

  /** Signal for the currently selected device */
  readonly selectedDevice = this.store.selectedDevice;

  /** Total active devices count for subtitle */
  readonly devicesCount = this.store.activeDevices;

  /**
   * Initializes the view by loading available telemetry devices.
   */
  ngOnInit(): void {
    this.store.loadInitialData();
  }
}
