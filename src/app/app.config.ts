import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { CustomerRepository } from './features/customers/domain/repositories/customer.repository';
import { CustomerApiService } from './features/customers/infrastructure/services/customer-api.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideTranslateService({
      loader: provideTranslateHttpLoader({prefix: './i18n/', suffix: '.json',}),
      fallbackLang: 'en'
    }),
    provideRouter(routes),
    { provide: CustomerRepository, useClass: CustomerApiService }
  ]
};

