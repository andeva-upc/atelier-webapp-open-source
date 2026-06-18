export class IngestTelemetryCommand {
  constructor(
    public obd2DeviceId: string,
    public snapshots: {
      rpm: number;
      temperature: number;
      speedKmh?: number;
      odometerKm?: number;
      fuelLevelPercent: number;
      createdAt?: string;
    }[]
  ) {}
}
