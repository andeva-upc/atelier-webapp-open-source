import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'customers',
    loadChildren: () =>
      import('./customers/presentation/customers.routes').then(
        (m) => m.customersRoutes
      ),
  },
  {
    path: 'billing',
    loadChildren: () =>
      import('./billing/presentation/billing.routes').then(
        (m) => m.billingRoutes
      ),
  },
  {
    path: 'telemetry',
    loadChildren: () =>
      import('./telemetry/presentation/telemetry.routes').then(
        (m) => m.telemetryRoutes
      ),
  },
  {
    path: 'inventory',
    loadChildren: () =>
      import('./inventory/presentation/inventory.routes').then(
        (m) => m.inventoryRoutes
      ),
  },
  {
    path: 'appointments',
    loadChildren: () =>
      import('./appointments/presentation/appointments.routes').then(
        (m) => m.appointmentsRoutes
      ),
  },
  {
    path: '',
    redirectTo: 'customers',
    pathMatch: 'full',
  },
];
