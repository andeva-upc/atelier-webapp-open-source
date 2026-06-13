export class UpdateWorkshopCommand {
  public businessName: string;
  public brandName: string;
  public taxId: string;
  public mileageIntervalConfig: number;

  constructor(props: {businessName: string, brandName: string, taxId: string, mileageIntervalConfig: number}) {
    this.businessName = props.businessName;
    this.brandName = props.brandName;
    this.taxId = props.taxId;
    this.mileageIntervalConfig = props.mileageIntervalConfig;
  }
}
