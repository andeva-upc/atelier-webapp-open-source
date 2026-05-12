import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { CustomerRepository } from './customers/domain/repositories/customer.repository';
import { CustomersApi } from './customers/infrastructure/customers-api';
import { VoucherRepository } from './billing/domain/repositories/voucher.repository';
import { QuoteRepository } from './billing/domain/repositories/quote.repository';
import { BillingApi } from './billing/infrastructure/billing-api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideTranslateService({
      loader: provideTranslateHttpLoader({prefix: './i18n/', suffix: '.json',}),
      fallbackLang: 'en'
    }),
    provideRouter(routes, withComponentInputBinding()),
    { provide: CustomerRepository, useClass: CustomersApi },
    { provide: VoucherRepository, useClass: BillingApi },
    { provide: QuoteRepository, useClass: BillingApi }
  ]
};

