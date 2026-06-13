
export class GoogleSignInCommand {
  private _idToken: string;

  constructor(props: {idToken: string}) {
    this._idToken = props.idToken;
  }

  get idToken(): string {
    return this._idToken;
  }

  set idToken(value: string) {
    this._idToken = value;
  }
}
