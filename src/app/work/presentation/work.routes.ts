import { Routes } from '@angular/router';

const workOrdersList = () => import('./views/work-orders-list/work-orders-list').then(m => m.WorkOrdersList);

export const workRoutes: Routes = [
  {
    path: '',
    loadComponent: workOrdersList
  }
];
