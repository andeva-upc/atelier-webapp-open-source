import {BaseEntity} from '../../../../shared/domain/model/base-entity';

export class User extends BaseEntity {
  private _email: string;

  constructor(props: {id: string, email: string}) {
    super({id: props.id});
    this._email = props.email;
  }

  get email(): string {
    return this._email;
  }

  set email(value: string) {
    this._email = value;
  }
}
