import { BaseEntity } from '../domain/model/base-entity';
import { BaseResource, BaseResponse } from './base-response';

/**
 * Interface for Data Assemblers (Mappers).
 * Decouples the backend resource schema (DTO) from the pure front-end Domain Model (Entity).
 * 
 * @public
 */
export interface BaseAssembler<
  TEntity extends BaseEntity,
  TResource extends BaseResource,
  TResponse extends BaseResponse
> {
  /**
   * Translates a network Resource (DTO) into a clean Domain Entity.
   */
  toEntityFromResource(resource: TResource): TEntity;

  /**
   * Translates a clean Domain Entity back into a network Resource DTO for writing operations.
   */
  toResourceFromEntity(entity: TEntity): TResource;

  /**
   * Translates a wrapped backend response containing a collection/pagination metadata into an array of Domain Entities.
   */
  toEntitiesFromResponse(response: TResponse): TEntity[];
}

