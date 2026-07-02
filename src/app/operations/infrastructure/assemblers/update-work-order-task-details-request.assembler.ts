import { UpdateWorkOrderTaskDetailsCommand } from '../../domain/model/commands/update-work-order-task-details.command';
import { UpdateWorkOrderTaskDetailsRequest } from '../requests/update-work-order-task-details.request';

export class UpdateWorkOrderTaskDetailsRequestAssembler {
  static toRequestFromCommand(command: UpdateWorkOrderTaskDetailsCommand): UpdateWorkOrderTaskDetailsRequest {
    return {
      serviceId: command.serviceId,
      assignedMechanicId: command.assignedMechanicId,
      description: command.description
    };
  }
}


