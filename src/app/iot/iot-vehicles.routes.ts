import { Routes } from '@angular/router';

export const VEHICLES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/views/vehicles-list/vehicles-list').then(
        (m) => m.VehiclesListComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./presentation/views/vehicle-create/vehicle-create').then(
        (m) => m.VehicleCreateComponent
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./presentation/views/vehicle-edit/vehicle-edit').then(
        (m) => m.VehicleEditComponent
      ),
  },
  {
    path: ':id/telemetry',
    loadComponent: () =>
      import('./presentation/views/telemetry-dashboard/telemetry-dashboard').then(
        (m) => m.TelemetryDashboardComponent
      ),
  },
];
