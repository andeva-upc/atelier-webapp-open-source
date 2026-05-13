/**
 * Interface representing the minimal structure of a network resource (DTO).
 * Every backend resource mapped to this infrastructure must have a numeric ID.
 * 
 * @public
 */
export interface BaseResource {
  id: string | number;
  workshop_id: string;
  deleted_at?: string | null;
}

/**
 * Interface representing a wrapped response format (e.g., paginated metadata, envelope formats).
 * 
 * @public
 */
export interface BaseResponse {}
