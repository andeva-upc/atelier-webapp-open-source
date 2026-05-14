import { Routes } from '@angular/router';

const telemetryDashboard = () =>
  import('./telemetry-dashboard/telemetry-dashboard').then((m) => m.TelemetryDashboard);

/**
 * Route tree for telemetry presentation views.
 */
export const telemetryRoutes: Routes = [
  { path: '', loadComponent: telemetryDashboard },
];
