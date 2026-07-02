import { UpdateProductQuantityInTaskCommand } from '../../domain/model/commands/update-product-quantity-in-task.command';
import { UpdateProductQuantityInTaskRequest } from '../requests/update-product-quantity-in-task.request';

export class UpdateProductQuantityInTaskRequestAssembler {
  static toRequestFromCommand(command: UpdateProductQuantityInTaskCommand): UpdateProductQuantityInTaskRequest {
    return {
      quantity: command.newQuantity,
      newQuantity: command.newQuantity
    };
  }
}