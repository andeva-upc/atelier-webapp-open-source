export class AssignSubscriptionCommand {
  public planId: string;
  public billingCycle: string;
  public cardNumber: string;
  public cardHolderName: string;
  public expirationDate: string;
  public cvv: string;

  constructor(props: {planId: string, billingCycle: string, cardNumber: string, cardHolderName: string, expirationDate: string, cvv: string}) {
    this.planId = props.planId;
    this.billingCycle = props.billingCycle;
    this.cardNumber = props.cardNumber;
    this.cardHolderName = props.cardHolderName;
    this.expirationDate = props.expirationDate;
    this.cvv = props.cvv;
  }
}
