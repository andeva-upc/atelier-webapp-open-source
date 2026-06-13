export class CreateEmployeeCommand {
  public userId: string;
  public firstName: string;
  public lastName: string;
  public documentType: string;
  public documentNumber: string;
  public phone: string;

  constructor(props: {userId: string, firstName: string, lastName: string, documentType: string, documentNumber: string, phone: string}) {
    this.userId = props.userId;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.documentType = props.documentType;
    this.documentNumber = props.documentNumber;
    this.phone = props.phone;
  }
}
