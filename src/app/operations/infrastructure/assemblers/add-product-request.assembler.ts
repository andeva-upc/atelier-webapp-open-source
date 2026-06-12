import { AddProductToTaskCommand } from '../../domain/model/commands/add-product-to-task.command';
import { AddProductRequest } from '../requests/add-product.request';

export class AddProductRequestAssembler {
  static toRequestFromCommand(command: AddProductToTaskCommand): AddProductRequest {
    return {
      productId: command.productId,
      quantity: command.quantity,
      unitPrice: command.unitPrice
    };
  }
}