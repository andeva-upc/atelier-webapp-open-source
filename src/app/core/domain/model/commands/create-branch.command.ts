export class CreateBranchCommand {
  public workshopId: string;
  public code: string;
  public name: string;
  public address: string;
  public phone: string;

  constructor(props: {workshopId: string, code: string, name: string, address: string, phone: string}) {
    this.workshopId = props.workshopId;
    this.code = props.code;
    this.name = props.name;
    this.address = props.address;
    this.phone = props.phone;
  }
}
