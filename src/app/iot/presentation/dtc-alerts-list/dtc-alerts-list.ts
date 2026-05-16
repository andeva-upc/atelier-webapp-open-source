import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IotStore } from '../../application/iot.store';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matErrorOutline } from '@ng-icons/material-icons/baseline';

/**
 * Component that displays a list of active Diagnostic Trouble Code (DTC) alerts.
 */
@Component({
  selector: 'app-dtc-alerts-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgIcon],
  providers: [provideIcons({ matErrorOutline })],
  templateUrl: './dtc-alerts-list.html',
  styleUrl: './dtc-alerts-list.css'
})
export class DtcAlertsList {
  private readonly store = inject(IotStore);
  /**
   * List of active alerts with associated vehicle data for UI display.
   */
  readonly alertsUI = this.store.alertsWithVehicle;
}

