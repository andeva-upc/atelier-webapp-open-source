import { CreateAppointmentCommand } from '../../domain/model/commands/create-appointment.command';
import { CreateAppointmentRequest } from '../requests/create-appointment.request';

export class CreateAppointmentRequestAssembler {
  static toRequestFromCommand(command: CreateAppointmentCommand): CreateAppointmentRequest {
    return {
      branchId: command.branchId,
      customerId: command.customerId,
      vehicleId: command.vehicleId,
      scheduledStart: command.scheduledStart,
      notes: command.notes
    };
  }
}
