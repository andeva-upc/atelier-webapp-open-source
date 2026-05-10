import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'customers',
    loadComponent: () =>
      import('./features/customers/presentation/pages/customers/customers').then(
        (m) => m.Customers
      ),
  },
  {
    path: '',
    redirectTo: 'customers',
    pathMatch: 'full',
  },
];
