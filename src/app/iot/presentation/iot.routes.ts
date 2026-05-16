import { Routes } from '@angular/router';

const iotDashboard = () =>
  import('./iot-dashboard/iot-dashboard').then((m) => m.IotDashboard);

/**
 * Route tree for iot presentation views.
 */
export const iotRoutes: Routes = [
  { path: '', loadComponent: iotDashboard },
];

