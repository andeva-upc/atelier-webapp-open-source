
export class UpdateUserPasswordCommand {
  private _userId: string;
  private _currentPassword: string;
  private _newPassword: string;

  constructor(props: {userId: string, currentPassword: string, newPassword: string}) {
    this._userId = props.userId;
    this._currentPassword = props.currentPassword;
    this._newPassword = props.newPassword;
  }

  get userId(): string {
    return this._userId;
  }

  get currentPassword(): string {
    return this._currentPassword;
  }

  get newPassword(): string {
    return this._newPassword;
  }

  set userId(value: string) {
    this._userId = value;
  }

  set currentPassword(value: string) {
    this._currentPassword = value;
  }

  set newPassword(value: string) {
    this._newPassword = value;
  }
}
