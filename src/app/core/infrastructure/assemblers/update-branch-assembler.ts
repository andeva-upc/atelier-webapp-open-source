import { UpdateBranchCommand } from '../../domain/model/commands/update-branch.command';
import { UpdateBranchRequest } from '../requests/update-branch.request';
export class UpdateBranchAssembler {
  toRequestFromCommand(command: UpdateBranchCommand): UpdateBranchRequest {
    return { ...command };
  }
}