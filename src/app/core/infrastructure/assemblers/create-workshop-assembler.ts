import { CreateWorkshopCommand } from '../../domain/model/commands/create-workshop.command';
import { CreateWorkshopRequest } from '../requests/create-workshop.request';
export class CreateWorkshopAssembler {
  toRequestFromCommand(command: CreateWorkshopCommand): CreateWorkshopRequest {
    return { ...command };
  }
}