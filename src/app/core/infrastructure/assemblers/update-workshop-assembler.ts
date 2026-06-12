import { UpdateWorkshopCommand } from '../../domain/model/commands/update-workshop.command';
import { UpdateWorkshopRequest } from '../requests/update-workshop.request';
export class UpdateWorkshopAssembler {
  toRequestFromCommand(command: UpdateWorkshopCommand): UpdateWorkshopRequest {
    return { ...command };
  }
}