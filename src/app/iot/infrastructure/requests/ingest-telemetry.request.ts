export interface IngestTelemetryRequest {
  obd2DeviceId: string;
  snapshots: {
    rpm: number;
    temperature: number;
    speedKmh?: number;
    odometerKm?: number;
    fuelLevelPercent: number;
    createdAt?: string;
  }[];
}
