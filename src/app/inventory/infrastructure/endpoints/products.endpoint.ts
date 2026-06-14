import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

import { ProductResponse } from '../responses/product.response';
import { CreateProductCommand } from '../../domain/model/commands/create-product.command';
import { UpdateProductCommand } from '../../domain/model/commands/update-product.command';
import { AddBatchToProductCommand } from '../../domain/model/commands/add-batch-to-product.command';

@Injectable({ providedIn: 'root' })
export class ProductsApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/products`;

  constructor(private http: HttpClient) {}

  create(command: CreateProductCommand): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(`${this.baseUrl}`, command);
  }

  update(productId: string, command: UpdateProductCommand): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.baseUrl}/${productId}`, command);
  }

  delete(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${productId}`);
  }

  getByBranchId(branchId: string): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.baseUrl}/branch/${branchId}`);
  }

  getById(productId: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.baseUrl}/${productId}`);
  }

  addBatch(productId: string, command: AddBatchToProductCommand): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(`${this.baseUrl}/${productId}/batches`, command);
  }
}
