import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IotStore } from '../../application/iot.store';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matLink } from '@ng-icons/material-icons/baseline';
import { VehicleIotSelector } from '../vehicle-iot-selector';
import { MetricsGrid } from '../metrics-grid';
import { DtcAlertsList } from '../dtc-alerts-list';
import { HistoryChart } from '../history-chart';
import { LinkObdModal } from '../link-obd-modal';

/**
 * Main dashboard view for Iot.
 * Orchestrates the display of real-time metrics, historical charts, and active alerts.
 */
@Component({
  selector: 'app-iot-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgIcon,
    VehicleIotSelector,
    MetricsGrid,
    DtcAlertsList,
    HistoryChart,
    LinkObdModal
  ],
  providers: [
    provideIcons({ matLink })
  ],
  templateUrl: './iot-dashboard.html',
  styleUrl: './iot-dashboard.css'
})
export class IotDashboard implements OnInit {
  private readonly store = inject(IotStore);
  private readonly translate = inject(TranslateService);

  /** Signal indicating global loading state */
  readonly isLoading = this.store.loading;

  /** Signal for error messages */
  readonly error = this.store.error;

  /** Signal for the currently selected device */
  readonly selectedDevice = this.store.selectedDevice;

  /** Total active devices count for subtitle */
  readonly devicesCount = this.store.activeDevices;

  /** Modal state */
  readonly isModalOpen = signal<boolean>(false);

  /**
   * Initializes the view by loading available iot devices.
   */
  ngOnInit(): void {
    this.store.loadInitialData();
  }

  /**
   * Retries loading initial data.
   */
  retry(): void {
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
