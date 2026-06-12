export class CreateCustomerCommand {
  public userId: string;
  public isCorporate: boolean;
  public firstName: string;
  public lastName: string;
  public businessName: string;
  public documentType: string;
  public documentNumber: string;
  public phone: string;

  constructor(props: {userId: string, isCorporate: boolean, firstName: string, lastName: string, businessName: string, documentType: string, documentNumber: string, phone: string}) {
    this.userId = props.userId;
    this.isCorporate = props.isCorporate;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.businessName = props.businessName;
    this.documentType = props.documentType;
    this.documentNumber = props.documentNumber;
    this.phone = props.phone;
  }
}
