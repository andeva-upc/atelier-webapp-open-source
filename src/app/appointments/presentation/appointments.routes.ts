import { Routes } from '@angular/router';

const appointmentsList = () =>
  import('./views/appointments-list/appointments-list').then(
    (m) => m.AppointmentsList
  );

export const appointmentsRoutes: Routes = [
  {
    path: '',
    loadComponent: appointmentsList,
  },
  {
    path: 'new',
    loadComponent: appointmentsList,
  },
  {
    path: ':id/edit',
    loadComponent: appointmentsList,
  },
];
