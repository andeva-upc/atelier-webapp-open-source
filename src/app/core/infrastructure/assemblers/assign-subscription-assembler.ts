import { AssignSubscriptionCommand } from '../../domain/model/commands/assign-subscription.command';
import { AssignSubscriptionRequest } from '../requests/assign-subscription.request';
export class AssignSubscriptionAssembler {
  toRequestFromCommand(command: AssignSubscriptionCommand): AssignSubscriptionRequest {
    return { ...command };
  }
}