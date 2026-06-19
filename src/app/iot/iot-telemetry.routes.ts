import { Routes } from '@angular/router';
import { TelemetryDashboardComponent } from './presentation/views/telemetry-dashboard/telemetry-dashboard';

export const TELEMETRY_ROUTES: Routes = [
  { path: '', component: TelemetryDashboardComponent },
  {
    path: 'odb2_devices',
    loadComponent: () => import('./presentation/views/obd2-devices-list/obd2-devices-list').then(m => m.Obd2DevicesListComponent)
  }
];
