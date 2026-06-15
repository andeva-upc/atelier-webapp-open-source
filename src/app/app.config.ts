import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { MultiTranslateHttpLoader } from './shared/infrastructure/i18n/multi-translate-http-loader';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './app.routes';
import { iamInterceptor } from './iam/infrastructure/iam.interceptor';

export function HttpLoaderFactory(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    { prefix: './i18n/', suffix: '/shared.json' },
    { prefix: './i18n/', suffix: '/iam.json' },
    { prefix: './i18n/', suffix: '/core.json' },
    { prefix: './i18n/', suffix: '/operations.json' },
    { prefix: './i18n/', suffix: '/fleet.json' },
    { prefix: './i18n/', suffix: '/iot.json' },
    { prefix: './i18n/', suffix: '/inventory.json' },
    { prefix: './i18n/', suffix: '/billing.json' }
  ]);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([iamInterceptor])),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      fallbackLang: 'en'
    }),
    provideRouter(routes, withComponentInputBinding()),
    provideCharts(withDefaultRegisterables())
  ]
};
