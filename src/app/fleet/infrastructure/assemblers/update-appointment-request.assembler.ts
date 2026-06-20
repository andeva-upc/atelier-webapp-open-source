import { UpdateAppointmentCommand } from '../../domain/model/commands/update-appointment.command';
import { UpdateAppointmentRequest } from '../requests/update-appointment.request';

export class UpdateAppointmentRequestAssembler {
  static toRequestFromCommand(command: UpdateAppointmentCommand): UpdateAppointmentRequest {
    return {
      branchId: command.branchId,
      customerId: command.customerId,
      vehicleId: command.vehicleId,
      scheduledStart: command.scheduledStart,
      notes: command.notes
    };
  }
}
