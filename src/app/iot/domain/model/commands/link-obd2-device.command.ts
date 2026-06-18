export class LinkObd2DeviceCommand {
  constructor(
    public obd2DeviceId: string,
    public branchId: string,
    public vehicleId: string
  ) {}
}
