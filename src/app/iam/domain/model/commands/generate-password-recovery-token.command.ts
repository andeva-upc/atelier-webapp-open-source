
export class GeneratePasswordRecoveryTokenCommand {
  private _email: string;

  constructor(props: {email: string}) {
    this._email = props.email;
  }

  get email(): string {
    return this._email;
  }

  set email(value: string) {
    this._email = value;
  }
}
