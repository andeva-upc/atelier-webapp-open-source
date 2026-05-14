import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./home/presentation/home.routes').then(
        (m) => m.homeRoutes
      ),
  },
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
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
    },
];
