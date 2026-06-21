import { Routes } from '@angular/router';
import { StaffListComponent } from './presentation/views/staff-list/staff-list';
import { AppointmentsListComponent } from './presentation/views/appointments-list/appointments-list';
import { AppointmentFormComponent } from './presentation/views/appointment-form/appointment-form';
import { CustomersViewComponent } from './presentation/views/customers/customers';

export const FLEET_ROUTES: Routes = [
  { path: 'staff', component: StaffListComponent },
  { path: 'customers', component: CustomersViewComponent },
  { path: 'appointments', component: AppointmentsListComponent },
  { path: 'appointments/new', component: AppointmentFormComponent },
  { path: 'appointments/:id/edit', component: AppointmentFormComponent },
  { path: '', redirectTo: 'appointments', pathMatch: 'full' }
];
