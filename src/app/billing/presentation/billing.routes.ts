import { Routes } from '@angular/router';

const billingList = () =>
  import('./views/billing-list/billing-list').then(m => m.BillingList);

/**
 * Route tree for the billing bounded context presentation layer.
 *
 * @remarks
 * The root path delegates to the BillingList view which renders both
 * the vouchers summary and the quotations tabs.
 */
export const billingRoutes: Routes = [
  { path: '', loadComponent: billingList },
];

