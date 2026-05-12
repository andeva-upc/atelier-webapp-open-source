import { Routes } from '@angular/router';
import { AppointmentsList } from './views/appointments-list/appointments-list';

export const appointmentsRoutes: Routes = [
  {
    path: '',
    component: AppointmentsList
  }
];