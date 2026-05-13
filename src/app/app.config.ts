import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { CustomerRepository } from './customers/domain/repositories/customer.repository';
import { CustomersApi } from './customers/infrastructure/customers-api';
import { InventoryRepository } from './inventory/domain/repositories/inventory.repository';
import { InventoryApi } from './inventory/infrastructure/inventory-api';

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
    { provide: InventoryRepository, useClass: InventoryApi }
  ]
};

