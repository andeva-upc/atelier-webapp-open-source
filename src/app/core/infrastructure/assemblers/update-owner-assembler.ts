import { UpdateOwnerCommand } from '../../domain/model/commands/update-owner.command';
import { UpdateOwnerRequest } from '../requests/update-owner.request';
export class UpdateOwnerAssembler {
  toRequestFromCommand(command: UpdateOwnerCommand): UpdateOwnerRequest {
    return { ...command };
  }
}