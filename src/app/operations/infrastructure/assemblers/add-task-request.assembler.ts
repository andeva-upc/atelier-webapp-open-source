import { AddTaskToWorkOrderCommand } from '../../domain/model/commands/add-task-to-work-order.command';
import { AddTaskRequest } from '../requests/add-task.request';

export class AddTaskRequestAssembler {
  static toRequestFromCommand(command: AddTaskToWorkOrderCommand): AddTaskRequest {
    return {
      serviceId: command.serviceId,
      assignedMechanicId: command.assignedMechanicId,
      description: command.description
    };
  }
}