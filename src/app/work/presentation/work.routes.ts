import { Routes } from '@angular/router';

const workOrdersList = () =>
  import('./views/work-orders-list/work-orders-list').then((m) => m.WorkOrdersList);

/**
 * Route tree for work orders presentation views.
 *
 * Enables modular loading of work-order-related lists and detail screens
 * inside independent chunks.
 */
export const workRoutes: Routes = [
  { path: '', loadComponent: workOrdersList },
];
