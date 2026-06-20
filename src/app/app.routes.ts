import { Routes } from '@angular/router';
import { Home } from './shared/presentation/views/home/home';

import { iamGuard } from './iam/infrastructure/iam.guard';

const pageNotFound = () => import('./shared/presentation/views/page-not-found/page-not-found').then((m) => m.PageNotFound);
const iamRoutes = () => import('./iam/presentation/iam.routes').then((m) => m.iamRoutes);
const inventoryRoutes = () => import('./inventory/inventory.routes').then((m) => m.INVENTORY_ROUTES);
const billingRoutes = () => import('./billing/billing.routes').then((m) => m.BILLING_ROUTES);
const telemetryRoutes = () => import('./iot/iot-telemetry.routes').then((m) => m.TELEMETRY_ROUTES);
const workOrdersRoutes = () => import('./operations/presentation/work-orders.routes').then((m) => m.WORK_ORDERS_ROUTES);

/**
 * Defines the application routes. Each route is associated with a component that will be displayed when the route is accessed. The title property is used to set the document title when the route is active.
 * The routes are defined as an array of objects, where each object represents a route with its path, component, and title. The routes can also include lazy-loaded modules for better performance.
 * @summary Application routes configuration, defining paths, components, and titles for navigation.
 * @author Joel Huamani Estefanero
 * @see https://angular.io/guide/router for more information on Angular routing.
 */
export const routes: Routes = [
  { path: 'home', redirectTo: 'telemetry', pathMatch: 'full' },
  {
    path: 'vehicles',
    component: Home,
    canActivate: [iamGuard],
    children: [
      { path: '', loadChildren: telemetryRoutes }
    ]
  },
  {
    path: 'inventory',
    component: Home,
    canActivate: [iamGuard],
    children: [
      { path: '', loadChildren: inventoryRoutes }
    ]
  },
  {
    path: 'billing',
    component: Home,
    canActivate: [iamGuard],
    children: [
      { path: '', loadChildren: billingRoutes }
    ]
  },
  {
    path: 'telemetry',
    component: Home,
    canActivate: [iamGuard],
    children: [
      { path: '', loadChildren: telemetryRoutes }
    ]
  },
  {
    path: 'work-orders',
    component: Home,
    canActivate: [iamGuard],
    children: [
      { path: '', loadChildren: workOrdersRoutes }
    ]
  },
  {
    path: 'customers',
    component: Home,
    canActivate: [iamGuard],
    children: [
      { path: '', loadChildren: () => import('./fleet/fleet.routes').then(m => m.FLEET_ROUTES) }
    ]
  },
  { path: 'role-selection', loadComponent: () => import('./core/presentation/views/role-selection/role-selection').then(m => m.RoleSelectionComponent), canActivate: [iamGuard] },
  { path: '',  loadChildren: iamRoutes },
  { path: '',     redirectTo: 'home', pathMatch: 'full'},
  { path: '**',   loadComponent: pageNotFound },
];
