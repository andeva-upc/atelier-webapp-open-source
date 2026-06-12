export class CreateWorkshopCommand {
  public ownerId: string;
  public businessName: string;
  public brandName: string;
  public taxId: string;
  public mileageIntervalConfig: number;

  constructor(props: {ownerId: string, businessName: string, brandName: string, taxId: string, mileageIntervalConfig: number}) {
    this.ownerId = props.ownerId;
    this.businessName = props.businessName;
    this.brandName = props.brandName;
    this.taxId = props.taxId;
    this.mileageIntervalConfig = props.mileageIntervalConfig;
  }
}
