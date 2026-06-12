/**
 * BaseResource is a base interface for all resources in the application. It defines a common structure for resources by including an 'id' property, which can be either a number or a string. This interface can be extended by other resource interfaces to ensure that they all have a unique identifier.
 * @summary Base interface for all resources in the application, defining a common structure with an 'id' property.
 * @param {number|string} id A unique identifier for the resource, which is required for all resources that extend this base interface.
 * @author Joel Huamani Estefanero
 */
export interface BaseResource {
  /**
   * The unique identifier for the resource, which can be either a number or a string.
   * This property is required for all resources that extend this base interface.
   */
  id: number | string;
}

/**
 * BaseResponse is a base interface for all response objects in the application. It can be extended by other response interfaces to provide a common structure for API responses. This interface does not define any properties, but it serves as a marker interface to indicate that an object is a response.
 * @summary Base interface for all response objects in the application, serving as a marker interface to indicate that an object is a response.
 * @author Joel Huamani Estefanero
 */
export interface BaseResponse {}
