import { BaseEntity } from '../../../../shared/domain/model/base-entity';

export class Vehicle extends BaseEntity {
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  vin: string;

  constructor() {
    super({ id: '' });
    this.plateNumber = '';
    this.brand = '';
    this.model = '';
    this.year = 0;
    this.vin = '';
  }
}
