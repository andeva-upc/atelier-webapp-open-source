import {BaseEntity} from '../../../../shared/domain/model/base-entity';

export class Branch extends BaseEntity {
  private _workshopId: string;
  private _code: string;
  private _name: string;
  private _address: string;
  private _phone: string;

  constructor(props: {id: string, workshopId: string, code: string, name: string, address: string, phone: string}) {
    super({id: props.id});
    this._workshopId = props.workshopId;
    this._code = props.code;
    this._name = props.name;
    this._address = props.address;
    this._phone = props.phone;
  }

  get workshopId(): string {
    return this._workshopId;
  }

  set workshopId(value: string) {
    this._workshopId = value;
  }

  get code(): string {
    return this._code;
  }

  set code(value: string) {
    this._code = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get address(): string {
    return this._address;
  }

  set address(value: string) {
    this._address = value;
  }

  get phone(): string {
    return this._phone;
  }

  set phone(value: string) {
    this._phone = value;
  }
}
