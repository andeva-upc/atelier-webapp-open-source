export class CancelSubscriptionCommand {
  public branchId: string;

  constructor(props: { branchId: string }) {
    this.branchId = props.branchId;
  }
}
