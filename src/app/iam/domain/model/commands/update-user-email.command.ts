
export class UpdateUserEmailCommand {
  private _userId: string;
  private _newEmail: string;

  constructor(props: {userId: string, newEmail: string}) {
    this._userId = props.userId;
    this._newEmail = props.newEmail;
  }

  get userId(): string {
    return this._userId;
  }

  set userId(value: string) {
    this._userId = value;
  }

  get newEmail(): string {
    return this._newEmail;
  }

  set newEmail(value: string) {
    this._newEmail = value;
  }
}
