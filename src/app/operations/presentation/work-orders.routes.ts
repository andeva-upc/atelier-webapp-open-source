import { Routes } from '@angular/router';
import { WorkOrdersListComponent } from './views/work-orders-list/work-orders-list';
import { TaskFormViewComponent } from './views/task-form-view/task-form-view';
import { WorkOrderFormViewComponent } from './views/work-order-form-view/work-order-form-view';

export const WORK_ORDERS_ROUTES: Routes = [
  { path: '', component: WorkOrdersListComponent },
  { path: 'new', component: WorkOrderFormViewComponent },
  { path: ':id/edit', component: WorkOrderFormViewComponent },
  { path: 'tasks/new', component: TaskFormViewComponent },
  { path: 'tasks/:id/edit', component: TaskFormViewComponent }
];
