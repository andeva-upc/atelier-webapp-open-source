import { BaseEntity } from '../domain/model/base-entity';
import { BaseResource, BaseResponse } from './base-response';

/**
 * BaseAssembler is an interface that defines the contract for mapping between entities, resources, and responses in the application. It provides methods for converting a resource to an entity, converting an entity to a resource, and converting a response to a list of entities. This interface can be implemented by specific assemblers for different entities and resources in the application to ensure consistent mapping logic across the application.
 * @summary Interface defining the contract for mapping between entities, resources, and responses in the application, providing methods for converting a resource to an entity, converting an entity to a resource, and converting a response to a list of entities.
 * @param TEntity The type of the entity that extends BaseEntity, representing the domain model in the application.
 * @param TResource The type of the resource that extends BaseResource, representing the data transfer object used for communication with external systems or APIs.
 * @param TResponse The type of the response that extends BaseResponse, representing the response object returned from API endpoints.
 * @author Joel Huamani Estefanero
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
