import { Routes } from '@angular/router';

const customersList = () =>
  import('./views/customers-list/customers-list').then((m) => m.CustomersList);

/**
 * Route tree for customers presentation views.
 * 
 * Enables modular loading of customer-related lists, detail screens,
 * and forms inside independent chunks.
 */
export const customersRoutes: Routes = [
  { path: '', loadComponent: customersList },
];

