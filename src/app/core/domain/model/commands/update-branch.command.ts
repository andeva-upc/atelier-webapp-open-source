export class UpdateBranchCommand {
  public code: string;
  public name: string;
  public address: string;
  public phone: string;

  constructor(props: {code: string, name: string, address: string, phone: string}) {
    this.code = props.code;
    this.name = props.name;
    this.address = props.address;
    this.phone = props.phone;
  }
}
