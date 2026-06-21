import { CreateWorkOrderCommand } from '../../domain/model/commands/create-work-order.command';
import { CreateWorkOrderRequest } from '../requests/create-work-order.request';

export class CreateWorkOrderRequestAssembler {
  static toRequestFromCommand(command: CreateWorkOrderCommand): CreateWorkOrderRequest {
    return {
      appointmentId: command.appointmentId,
      branchId: command.branchId,
      vehicleId: command.vehicleId,
      customerId: command.customerId,
      diagnosticSummary: command.diagnosticSummary,
      mileageIn: command.mileageIn
    };
  }
}