
export class SignUpCommand {
  public email: string;
  public password: string;

  constructor(props: {email: string, password: string}) {
    this.email = props.email;
    this.password = props.password;
  }
}
