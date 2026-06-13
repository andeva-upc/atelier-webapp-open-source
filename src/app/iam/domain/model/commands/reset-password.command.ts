
export class ResetPasswordCommand {
  private _token: string;
  private _newPassword: string;

  constructor(props: {token: string, newPassword: string}) {
    this._token = props.token;
    this._newPassword = props.newPassword;
  }

  get token(): string {
    return this._token;
  }

  set token(value: string) {
    this._token = value;
  }

  get newPassword(): string {
    return this._newPassword;
  }

  set newPassword(value: string) {
    this._newPassword = value;
  }
}
