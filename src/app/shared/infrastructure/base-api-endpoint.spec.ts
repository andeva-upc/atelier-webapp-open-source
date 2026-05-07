import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { BaseEntity } from '../domain/model/base-entity';
import { BaseResource, BaseResponse } from './base-response';
import { BaseAssembler } from './base-assembler';
import { BaseApiEndpoint } from './base-api-endpoint';

// --- MOCK DEFINITIONS FOR TESTING ---

class TestProduct implements BaseEntity {
  id: string | number;
  name: string;
  constructor(id: string | number, name: string) {
    this.id = id;
    this.name = name;
  }
}

interface TestProductResource extends BaseResource {
  product_name: string;
}

class TestProductAssembler implements BaseAssembler<TestProduct, TestProductResource, BaseResponse> {
  toEntityFromResource(resource: TestProductResource): TestProduct {
    return new TestProduct(resource.id, resource.product_name);
  }

  toResourceFromEntity(entity: TestProduct): TestProductResource {
    return {
      id: entity.id,
      product_name: entity.name
    };
  }

  toEntitiesFromResponse(response: BaseResponse): TestProduct[] {
    return [];
  }
}

class TestProductApiEndpoint extends BaseApiEndpoint<
  TestProduct,
  TestProductResource,
  BaseResponse,
  TestProductAssembler
> {
  constructor(http: HttpClient) {
    super(http, 'http://localhost:3000/api/v1/products', new TestProductAssembler());
  }
}

// --- TEST SUITE ---

describe('BaseApiEndpoint', () => {
  let endpoint: TestProductApiEndpoint;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: TestProductApiEndpoint,
          useFactory: (http: HttpClient) => new TestProductApiEndpoint(http),
          deps: [HttpClient]
        }
      ]
    });

    endpoint = TestBed.inject(TestProductApiEndpoint);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should retrieve all items and map them to entities', () => {
    const mockResources: TestProductResource[] = [
      { id: 1, product_name: 'Brake Fluid' },
      { id: 2, product_name: 'Engine Oil Filter' }
    ];

    endpoint.getAll().subscribe((products) => {
      expect(products.length).toBe(2);
      expect(products[0]).toBeInstanceOf(TestProduct);
      expect(products[0].id).toBe(1);
      expect(products[0].name).toBe('Brake Fluid');
      expect(products[1].name).toBe('Engine Oil Filter');
    });

    const req = httpTestingController.expectOne('http://localhost:3000/api/v1/products');
    expect(req.request.method).toBe('GET');
    req.flush(mockResources);
  });

  it('should retrieve a single item by id and map it', () => {
    const mockResource: TestProductResource = { id: 10, product_name: 'Spark Plug' };

    endpoint.getById(10).subscribe((product) => {
      expect(product).toBeInstanceOf(TestProduct);
      expect(product.id).toBe(10);
      expect(product.name).toBe('Spark Plug');
    });

    const req = httpTestingController.expectOne('http://localhost:3000/api/v1/products/10');
    expect(req.request.method).toBe('GET');
    req.flush(mockResource);
  });

  it('should create an item and map returned resource to entity', () => {
    const newProduct = new TestProduct(0, 'Car Battery');
    const returnedResource: TestProductResource = { id: 45, product_name: 'Car Battery' };

    endpoint.create(newProduct).subscribe((product) => {
      expect(product.id).toBe(45);
      expect(product.name).toBe('Car Battery');
    });

    const req = httpTestingController.expectOne('http://localhost:3000/api/v1/products');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ id: 0, product_name: 'Car Battery' });
    req.flush(returnedResource);
  });

  it('should update an item and map returned resource', () => {
    const updatedProduct = new TestProduct(15, 'Brembo Brake Pads');
    const returnedResource: TestProductResource = { id: 15, product_name: 'Brembo Brake Pads' };

    endpoint.update(updatedProduct, 15).subscribe((product) => {
      expect(product.id).toBe(15);
      expect(product.name).toBe('Brembo Brake Pads');
    });

    const req = httpTestingController.expectOne('http://localhost:3000/api/v1/products/15');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ id: 15, product_name: 'Brembo Brake Pads' });
    req.flush(returnedResource);
  });

  it('should partially patch an item', () => {
    const partialResource: Partial<TestProductResource> = { product_name: 'Bosch Spark Plugs' };
    const returnedResource: TestProductResource = { id: 8, product_name: 'Bosch Spark Plugs' };

    endpoint.patch(8, partialResource).subscribe((product) => {
      expect(product.id).toBe(8);
      expect(product.name).toBe('Bosch Spark Plugs');
    });

    const req = httpTestingController.expectOne('http://localhost:3000/api/v1/products/8');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ product_name: 'Bosch Spark Plugs' });
    req.flush(returnedResource);
  });

  it('should delete an item by ID', () => {
    endpoint.delete(22).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpTestingController.expectOne('http://localhost:3000/api/v1/products/22');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('should search items using find query params', () => {
    const mockResources: TestProductResource[] = [
      { id: 3, product_name: 'Brake Pads Set' }
    ];

    endpoint.find({ q: 'Brake', active: 'true' }).subscribe((products) => {
      expect(products.length).toBe(1);
      expect(products[0].name).toBe('Brake Pads Set');
    });

    const req = httpTestingController.expectOne(
      (request) => request.url === 'http://localhost:3000/api/v1/products' && request.params.get('q') === 'Brake' && request.params.get('active') === 'true'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResources);
  });

  it('should translate 404 HttpErrorResponse into correct custom Error message', () => {
    endpoint.getById(99).subscribe({
      next: () => {
        throw new Error('Should have failed');
      },
      error: (err) => {
        expect(err.message).toBe('Failed to fetch entity with id 99: Resource not found');
      }
    });

    const req = httpTestingController.expectOne('http://localhost:3000/api/v1/products/99');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });
});
