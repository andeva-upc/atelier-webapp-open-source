import { Injectable } from '@angular/core';
import { ProductsApiEndpoint } from './endpoints/products.endpoint';

@Injectable({ providedIn: 'root' })
export class InventoryApi {
  constructor(
    public readonly products: ProductsApiEndpoint
  ) {}
}
