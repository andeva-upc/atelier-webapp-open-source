/**
 * BaseEntity is a base class for all entities in the application. It provides a common id property and can be extended by other entities to inherit this property.
 * @summary Base class for all entities in the application, providing a common id property.
 * @param {number|string} id A unique identifier for the entity, which is required for all entities that extend this base class.
 * @author Joel Huamani Estefanero
 */
export class BaseEntity {
  /**
   * The unique indentifier for the entity, which can be a number or a string.
   * @protected
   */
  protected _id: number | string;

  /**
   * Creates an instance of BaseEntity with the given properties.
   * @param props
   */
  constructor(props: {id: number | string}) {
    this._id = props.id;
  }

  /**
   * Gets the unique identifier of the entity.
   * @returns The unique identifier, which can be a number or a string.
   */
  get id(): number | string {
    return this._id;
  }

  /**
   * Sets the unique identifier of the entity.
   * @param value
   */
  set id(value: number | string) {
    this._id = value;
  }
}
