export class UpdateCustomerCommand {
  public firstName: string;
  public lastName: string;
  public businessName: string;
  public documentType: string;
  public documentNumber: string;
  public phone: string;

  constructor(props: {firstName: string, lastName: string, businessName: string, documentType: string, documentNumber: string, phone: string}) {
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.businessName = props.businessName;
    this.documentType = props.documentType;
    this.documentNumber = props.documentNumber;
    this.phone = props.phone;
  }
}
