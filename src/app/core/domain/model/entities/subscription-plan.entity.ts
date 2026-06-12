import {BaseEntity} from '../../../../shared/domain/model/base-entity';

export class SubscriptionPlan extends BaseEntity {
  private _name: string;
  private _monthlyPrice: number;
  private _maxObd2Devices: number;
  private _maxMonthlySnapshotsPerVehicle: number;
  private _maxCustomers: number;
  private _maxStaffAccounts: number;
  private _isActive: boolean;

  constructor(props: {id: string, name: string, monthlyPrice: number, maxObd2Devices: number, maxMonthlySnapshotsPerVehicle: number, maxCustomers: number, maxStaffAccounts: number, isActive: boolean}) {
    super({id: props.id});
    this._name = props.name;
    this._monthlyPrice = props.monthlyPrice;
    this._maxObd2Devices = props.maxObd2Devices;
    this._maxMonthlySnapshotsPerVehicle = props.maxMonthlySnapshotsPerVehicle;
    this._maxCustomers = props.maxCustomers;
    this._maxStaffAccounts = props.maxStaffAccounts;
    this._isActive = props.isActive;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get monthlyPrice(): number {
    return this._monthlyPrice;
  }

  set monthlyPrice(value: number) {
    this._monthlyPrice = value;
  }

  get maxObd2Devices(): number {
    return this._maxObd2Devices;
  }

  set maxObd2Devices(value: number) {
    this._maxObd2Devices = value;
  }

  get maxMonthlySnapshotsPerVehicle(): number {
    return this._maxMonthlySnapshotsPerVehicle;
  }

  set maxMonthlySnapshotsPerVehicle(value: number) {
    this._maxMonthlySnapshotsPerVehicle = value;
  }

  get maxCustomers(): number {
    return this._maxCustomers;
  }

  set maxCustomers(value: number) {
    this._maxCustomers = value;
  }

  get maxStaffAccounts(): number {
    return this._maxStaffAccounts;
  }

  set maxStaffAccounts(value: number) {
    this._maxStaffAccounts = value;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  set isActive(value: boolean) {
    this._isActive = value;
  }
}
