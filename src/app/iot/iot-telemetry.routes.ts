import { Routes } from '@angular/router';
import { TelemetryDashboardComponent } from './presentation/views/telemetry-dashboard/telemetry-dashboard';

export const TELEMETRY_ROUTES: Routes = [
  { path: '', component: TelemetryDashboardComponent },
  {
    path: 'odb2_devices',
    loadComponent: () => import('./presentation/views/obd2-devices-list/obd2-devices-list').then(m => m.Obd2DevicesListComponent)
  },
  {
    path: 'odb2_devices/new',
    loadComponent: () => import('./presentation/views/obd2-device-create/obd2-device-create').then(m => m.Obd2DeviceCreateComponent)
  },
  {
    path: 'odb2_device_registrations/new',
    loadComponent: () => import('./presentation/views/obd2-device-registration-create/obd2-device-registration-create').then(m => m.Obd2DeviceRegistrationCreateComponent)
  },
  {
    path: 'odb2_devices/:id/edit',
    loadComponent: () => import('./presentation/views/obd2-device-edit/obd2-device-edit').then(m => m.Obd2DeviceEditComponent)
  }
];
