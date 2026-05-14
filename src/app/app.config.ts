import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { CustomerRepository } from './customers/domain/repositories/customer.repository';
import { CustomersApi } from './customers/infrastructure/customers-api';
import { AppointmentRepository } from './appointments/domain/repositories/appointments.repository';
import { AppointmentsApi } from './appointments/infrastructure/appointments-api';

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
    { provide: AppointmentRepository, useClass: AppointmentsApi }
  ]
};

