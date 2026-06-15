import { Routes } from '@angular/router';
import { Home } from './shared/presentation/views/home/home';

import { iamGuard } from './iam/infrastructure/iam.guard';

const pageNotFound = () => import('./shared/presentation/views/page-not-found/page-not-found').then((m) => m.PageNotFound);
const iamRoutes = () => import('./iam/presentation/iam.routes').then((m) => m.iamRoutes);

/**
 * Defines the application routes. Each route is associated with a component that will be displayed when the route is accessed. The title property is used to set the document title when the route is active.
 * The routes are defined as an array of objects, where each object represents a route with its path, component, and title. The routes can also include lazy-loaded modules for better performance.
 * @summary Application routes configuration, defining paths, components, and titles for navigation.
 * @author Joel Huamani Estefanero
 * @see https://angular.io/guide/router for more information on Angular routing.
 */
export const routes: Routes = [
  { path: 'home', component: Home,    canActivate: [iamGuard] },
  { path: 'role-selection', loadComponent: () => import('./core/presentation/views/role-selection/role-selection').then(m => m.RoleSelectionComponent), canActivate: [iamGuard] },
  { path: '',  loadChildren: iamRoutes },
  { path: '',     redirectTo: 'home', pathMatch: 'full'},
  { path: '**',   loadComponent: pageNotFound },
];
