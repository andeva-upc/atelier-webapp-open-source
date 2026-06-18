export class Vehicle {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  vin: string;

  constructor() {
    this.id = '';
    this.plateNumber = '';
    this.brand = '';
    this.model = '';
    this.year = 0;
    this.vin = '';
  }
}
