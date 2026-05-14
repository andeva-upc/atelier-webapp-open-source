import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TelemetryStore } from '../../application/telemetry.store';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matLink } from '@ng-icons/material-icons/baseline';
import { VehicleTelemetrySelector } from '../vehicle-telemetry-selector/vehicle-telemetry-selector';
import { MetricsGrid } from '../metrics-grid/metrics-grid';
import { DtcAlertsList } from '../dtc-alerts-list/dtc-alerts-list';
import { HistoryChart } from '../history-chart/history-chart';
import { LinkObdModal } from '../link-obd-modal/link-obd-modal';

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
    HistoryChart,
    LinkObdModal
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

  /** Modal state */
  readonly isModalOpen = signal<boolean>(false);

  /**
   * Initializes the view by loading available telemetry devices.
   */
  ngOnInit(): void {
    this.store.loadInitialData();
  }

  /**
   * Opens the Link OBD2 modal.
   */
  openLinkModal(): void {
    this.isModalOpen.set(true);
  }

  /**
   * Closes the Link OBD2 modal.
   */
  closeLinkModal(): void {
    this.isModalOpen.set(false);
  }
}
