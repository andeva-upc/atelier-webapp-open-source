export class CreateObd2DeviceCommand {
  constructor(
    public branchId: string,
    public macAddress: string
  ) {}
}
