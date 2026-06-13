import { CreateBranchCommand } from '../../domain/model/commands/create-branch.command';
import { CreateBranchRequest } from '../requests/create-branch.request';
export class CreateBranchAssembler {
  toRequestFromCommand(command: CreateBranchCommand): CreateBranchRequest {
    return { ...command };
  }
}