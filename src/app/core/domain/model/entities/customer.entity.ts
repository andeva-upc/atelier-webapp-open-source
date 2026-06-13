import {BaseEntity} from '../../../../shared/domain/model/base-entity';

export class Customer extends BaseEntity {
  private _userId: string;
  private _isCorporate: boolean;
  private _firstName: string;
  private _lastName: string;
  private _businessName: string;
  private _documentType: string;
  private _documentNumber: string;
  private _phone: string;

  constructor(props: {id: string, userId: string, isCorporate: boolean, firstName: string, lastName: string, businessName: string, documentType: string, documentNumber: string, phone: string}) {
    super({id: props.id});
    this._userId = props.userId;
    this._isCorporate = props.isCorporate;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._businessName = props.businessName;
    this._documentType = props.documentType;
    this._documentNumber = props.documentNumber;
    this._phone = props.phone;
  }

  get userId(): string {
    return this._userId;
  }

  set userId(value: string) {
    this._userId = value;
  }

  get isCorporate(): boolean {
    return this._isCorporate;
  }

  set isCorporate(value: boolean) {
    this._isCorporate = value;
  }

  get firstName(): string {
    return this._firstName;
  }

  set firstName(value: string) {
    this._firstName = value;
  }

  get lastName(): string {
    return this._lastName;
  }

  set lastName(value: string) {
    this._lastName = value;
  }

  get businessName(): string {
    return this._businessName;
  }

  set businessName(value: string) {
    this._businessName = value;
  }

  get documentType(): string {
    return this._documentType;
  }

  set documentType(value: string) {
    this._documentType = value;
  }

  get documentNumber(): string {
    return this._documentNumber;
  }

  set documentNumber(value: string) {
    this._documentNumber = value;
  }

  get phone(): string {
    return this._phone;
  }

  set phone(value: string) {
    this._phone = value;
  }
}
