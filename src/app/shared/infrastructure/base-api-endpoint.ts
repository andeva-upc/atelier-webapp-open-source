import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { BaseEntity } from '../domain/model/base-entity';
import { BaseResource, BaseResponse } from './base-response';
import { BaseAssembler } from './base-assembler';
import { BaseApi } from './base-api';

/**
 * Generic Base Class for REST API Endpoints using Angular HttpClient.
 * Automatically translates Resource DTOs to Domain Entities using the injected Assembler.
 * 
 * @public
 */
export abstract class BaseApiEndpoint<
  TEntity extends BaseEntity,
  TResource extends BaseResource,
  TResponse extends BaseResponse,
  TAssembler extends BaseAssembler<TEntity, TResource, TResponse>
> extends BaseApi {
  protected constructor(
    protected http: HttpClient,
    protected endpointUrl: string,
    protected assembler: TAssembler
  ) {
    super();
  }


  /**
   * Retrieves all items from the collection.
   */
  getAll(): Observable<TEntity[]> {
    return this.http.get<TResponse | TResource[]>(this.endpointUrl).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response.map(resource => this.assembler.toEntityFromResource(resource));
        }
        return this.assembler.toEntitiesFromResponse(response as TResponse);
      }),
      catchError(this.handleError('Failed to fetch entities'))
    );
  }

  /**
   * Retrieves a single item by its ID.
   */
  getById(id: string | number): Observable<TEntity> {
    return this.http.get<TResource>(`${this.endpointUrl}/${id}`).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError(`Failed to fetch entity with id ${id}`))
    );
  }

  /**
   * Performs searching and filtering using query parameters.
   */
  find(params: { [key: string]: any } = {}): Observable<TEntity[]> {
    return this.http.get<TResponse | TResource[]>(this.endpointUrl, { params }).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response.map(resource => this.assembler.toEntityFromResource(resource));
        }
        return this.assembler.toEntitiesFromResponse(response as TResponse);
      }),
      catchError(this.handleError('Failed to search entities'))
    );
  }

  /**
   * Creates a new resource entry.
   */
  create(entity: TEntity): Observable<TEntity> {
    const resource = this.assembler.toResourceFromEntity(entity);
    return this.http.post<TResource>(this.endpointUrl, resource).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create entity'))
    );
  }

  /**
   * Updates an existing resource completely (PUT).
   */
  update(entity: TEntity, id: string | number): Observable<TEntity> {
    const resource = this.assembler.toResourceFromEntity(entity);
    return this.http.put<TResource>(`${this.endpointUrl}/${id}`, resource).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError(`Failed to update entity with id ${id}`))
    );
  }

  /**
   * Performs a partial update on a resource (PATCH).
   */
  patch(id: string | number, partialResource: Partial<TResource>): Observable<TEntity> {
    return this.http.patch<TResource>(`${this.endpointUrl}/${id}`, partialResource).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError(`Failed to patch entity with id ${id}`))
    );
  }

  /**
   * Deletes a resource by its identifier.
   */
  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.endpointUrl}/${id}`).pipe(
      catchError(this.handleError(`Failed to delete entity with id ${id}`))
    );
  }

}


