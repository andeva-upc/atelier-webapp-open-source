export class UpdateVehicleCommand {
  constructor(
    public plateNumber: string,
    public brand: string,
    public model: string,
    public year: number,
    public vin: string
  ) {}
}
