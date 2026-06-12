import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Custom TranslateLoader that loads multiple translation files for a given language and merges them into a single translation object.
 * This allows you to organize your translations into multiple files (e.g., shared.json, iam.json, core.json, etc.) and load them all at once.
 * @author Joel Huamani Estefanero
 */
export interface ITranslationResource {
  prefix: string;
  suffix: string;
}

/**
 * MultiTranslateHttpLoader is a custom implementation of the TranslateLoader interface that loads multiple translation files for a given language and merges them into a single translation object.
 * It uses the HttpClient to fetch the translation files and handles any errors that may occur during the loading process.
 * The getTranslation method returns an Observable that emits the merged translation object once all files have been loaded successfully.
 * If any file fails to load, it logs the error and continues with an empty object for that file, ensuring that the application can still function with partial translations.
 * @author Joel Huamani Estefanero
 */
export class MultiTranslateHttpLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    private resources: ITranslationResource[]
  ) {}

  /**
   * Gets the translation object for the specified language by loading multiple translation files and merging their contents.
   * @param lang The language code for which to load the translations (e.g., 'en', 'fr', etc.).
   * @returns An Observable that emits the merged translation object once all files have been loaded successfully.
   * If any file fails to load, it logs the error and continues with an empty object for that file.
   * @author Joel Huamani Estefanero
   */
  public getTranslation(lang: string): Observable<any> {
    const requests = this.resources.map(resource => {
      const url = `${resource.prefix}${lang}${resource.suffix}`;
      return this.http.get(url).pipe(
        catchError((res) => {
          console.error(`Error loading translation file: ${url}`, res);
          return of({});
        })
      );
    });
    return forkJoin(requests).pipe(
      map(responses => {
        return responses.reduce((acc, curr) => {
          return { ...acc, ...curr };
        }, {});
      })
    );
  }
}
