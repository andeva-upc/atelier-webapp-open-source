import { Routes } from '@angular/router';

const appointmentsList = () =>
  import('./views/appointments-list/appointments-list').then(
    (m) => m.AppointmentsList
  );

const appointmentsForm = () =>
  import('./views/appointments-form/appointments-form').then(
    (m) => m.AppointmentsForm
  );

export const appointmentsRoutes: Routes = [
  {
    path: '',
    loadComponent: appointmentsList,
  },
  {
    path: 'new',
    loadComponent: appointmentsForm,
  },
  {
    path: ':id/edit',
    loadComponent: appointmentsForm,
  },
];
