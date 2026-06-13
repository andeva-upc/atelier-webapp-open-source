import { CreateOwnerCommand } from '../../domain/model/commands/create-owner.command';
import { CreateOwnerRequest } from '../requests/create-owner.request';
export class CreateOwnerAssembler {
  toRequestFromCommand(command: CreateOwnerCommand): CreateOwnerRequest {
    return { ...command };
  }
}