import { ErrorHandlingEnabledBaseType } from './error-handling-enabled-base-type';

/**
 * BaseApi is an abstract class that serves as a base for all API classes in the application. It does not define any properties or methods, but it can be extended by other API classes to provide a common structure for API interactions. This class serves as a marker to indicate that a class is an API class and can be used for type checking and organization of API-related code.
 * @summary Abstract base class for all API classes, providing a common structure for API interactions and serving as a marker for type checking and organization of API-related code.
 * @author Joel Huamani Estefanero
 */
export abstract class BaseApi extends ErrorHandlingEnabledBaseType {}

