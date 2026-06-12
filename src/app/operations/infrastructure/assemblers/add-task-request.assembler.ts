import { AddTaskToWorkOrderCommand } from '../../domain/model/commands/add-task-to-work-order.command';
import { AddTaskRequest } from '../requests/add-task.request';

export class AddTaskRequestAssembler {
  static toRequestFromCommand(command: AddTaskToWorkOrderCommand): AddTaskRequest {
    return {
      serviceId: command.serviceId,
      mechanicId: command.mechanicId,
      description: command.description,
      laborPrice: command.laborPrice
    };
  }
}