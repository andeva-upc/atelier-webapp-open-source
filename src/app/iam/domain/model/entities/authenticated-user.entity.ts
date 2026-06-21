import {BaseEntity} from '../../../../shared/domain/model/base-entity';
import {User} from './user.entity';

export class AuthenticatedUser extends BaseEntity {
  private _token: string;
  private _user: User;

  constructor(props: {id: string, token: string, user: User}) {
    super({id: props.id});
    this._token = props.token;
    this._user = props.user;
  }

  get token(): string {
    return this._token;
  }

  set token(value: string) {
    this._token = value;
  }

  get user(): User {
    return this._user;
  }

  set user(value: User) {
    this._user = value;
  }
}
