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
    path: '',
    redirectTo: 'customers',
    pathMatch: 'full',
  },
  {
  path: 'appointments',
  loadChildren: () =>
    import('./appointments/presentation/appointments.routes').then(
      (m) => m.appointmentsRoutes
    ),
  },
];
