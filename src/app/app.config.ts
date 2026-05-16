import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './app.routes';

import { CustomerRepository } from './customers/domain/repositories/customer.repository';
import { CustomersApi } from './customers/infrastructure/customers-api';

import { AppointmentRepository } from './appointments/domain/repositories/appointments.repository';
import { AppointmentsApi } from './appointments/infrastructure/appointments-api';

import { VoucherRepository } from './billing/domain/repositories/voucher.repository';
import { QuoteRepository } from './billing/domain/repositories/quote.repository';
import { BillingApi } from './billing/infrastructure/billing-api';

import { TelemetryRepository } from './telemetry/domain/repositories/telemetry.repository';
import { TelemetryApi } from './telemetry/infrastructure/telemetry-api';

import { DashboardRepository } from './home/domain/repositories/dashboard.repository';
import { DashboardApi } from './home/infrastructure/dashboard-api';

import { InventoryRepository } from './inventory/domain/repositories/inventory.repository';
import { InventoryApi } from './inventory/infrastructure/inventory-api';

import { WorkOrderRepository } from './work-orders/domain/repositories/work-order.repository';
import { WorkOrdersApi } from './work-orders/infrastructure/work-orders-api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: './i18n/', suffix: '.json' }),
      fallbackLang: 'en'
    }),
    provideRouter(routes, withComponentInputBinding()),
    provideCharts(withDefaultRegisterables()),

    { provide: CustomerRepository, useClass: CustomersApi },
    { provide: AppointmentRepository, useClass: AppointmentsApi },
    { provide: VoucherRepository, useClass: BillingApi },
    { provide: QuoteRepository, useClass: BillingApi },
    { provide: TelemetryRepository, useClass: TelemetryApi },
    { provide: DashboardRepository, useClass: DashboardApi },
    { provide: InventoryRepository, useClass: InventoryApi },
    { provide: WorkOrderRepository, useClass: WorkOrdersApi }
  ]
};
