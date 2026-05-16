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
    path: 'iot',
    loadChildren: () =>
      import('./iot/presentation/iot.routes').then(
        (m) => m.iotRoutes
      ),
  },
  {
    path: '',
    redirectTo: 'customers',
    pathMatch: 'full',
    },
];

