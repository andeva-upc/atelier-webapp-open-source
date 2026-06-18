import { UpdateAppointmentCommand } from '../../domain/model/commands/update-appointment.command';
import { UpdateAppointmentRequest } from '../requests/update-appointment.request';

export class UpdateAppointmentRequestAssembler {
  static toRequestFromCommand(command: UpdateAppointmentCommand): UpdateAppointmentRequest {
    return {
      scheduledStart: command.scheduledStart,
      scheduledEnd: command.scheduledEnd,
      notes: command.notes,
      status: command.status
    };
  }
}
