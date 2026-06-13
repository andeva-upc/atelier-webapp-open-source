import { UpdateWorkOrderDetailsCommand } from '../../domain/model/commands/update-work-order-details.command';
import { UpdateWorkOrderDetailsRequest } from '../requests/update-work-order-details.request';

export class UpdateWorkOrderDetailsRequestAssembler {
  static toRequestFromCommand(command: UpdateWorkOrderDetailsCommand): UpdateWorkOrderDetailsRequest {
    return {
      diagnosticSummary: command.diagnosticSummary,
      mileageIn: command.mileageIn
    };
  }
}