import { IngestTelemetryCommand } from '../../domain/model/commands/ingest-telemetry.command';
import { IngestTelemetryRequest } from '../requests/ingest-telemetry.request';

export class IngestTelemetryRequestAssembler {
  static toRequestFromCommand(command: IngestTelemetryCommand): IngestTelemetryRequest {
    return {
      obd2DeviceId: command.obd2DeviceId,
      snapshots: command.snapshots.map(s => ({
        rpm: s.rpm,
        temperature: s.temperature,
        speedKmh: s.speedKmh,
        odometerKm: s.odometerKm,
        fuelLevelPercent: s.fuelLevelPercent,
        createdAt: s.createdAt
      }))
    };
  }
}
