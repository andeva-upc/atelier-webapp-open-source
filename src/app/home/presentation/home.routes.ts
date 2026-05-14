import { Routes } from '@angular/router';
import { HomeDashboard } from './views/home-dashboard/home-dashboard';
import { DashboardRepository } from '../domain/repositories/dashboard.repository';
import { DashboardApi } from '../infrastructure/dashboard-api';

export const homeRoutes: Routes = [
  {
    path: '',
    component: HomeDashboard
  }
];
