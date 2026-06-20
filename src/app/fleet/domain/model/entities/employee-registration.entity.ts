import { BaseEntity } from '../../../../shared/domain/model/base-entity';

export class EmployeeRegistration extends BaseEntity {
  private _employeeId: string;
  private _branchId: string;
  private _speciality: string;
  private _specialityName: string;
  private _salary: number;
  private _status: string;
  private _createdAt: string;
  private _updatedAt: string;
  private _deletedAt: string;

  constructor(props: {
    id: string;
    employeeId: string;
    branchId: string;
    speciality: string;
    specialityName: string;
    salary: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
  }) {
    super({ id: props.id });
    this._employeeId = props.employeeId;
    this._branchId = props.branchId;
    this._speciality = props.speciality;
    this._specialityName = props.specialityName;
    this._salary = props.salary;
    this._status = props.status;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._deletedAt = props.deletedAt;
  }

  get employeeId(): string {
    return this._employeeId;
  }

  set employeeId(value: string) {
    this._employeeId = value;
  }

  get branchId(): string {
    return this._branchId;
  }

  set branchId(value: string) {
    this._branchId = value;
  }

  get speciality(): string {
    return this._speciality;
  }

  set speciality(value: string) {
    this._speciality = value;
  }

  get specialityName(): string {
    return this._specialityName;
  }

  set specialityName(value: string) {
    this._specialityName = value;
  }

  get salary(): number {
    return this._salary;
  }

  set salary(value: number) {
    this._salary = value;
  }

  get status(): string {
    return this._status;
  }

  set status(value: string) {
    this._status = value;
  }

  get createdAt(): string {
    return this._createdAt;
  }

  set createdAt(value: string) {
    this._createdAt = value;
  }

  get updatedAt(): string {
    return this._updatedAt;
  }

  set updatedAt(value: string) {
    this._updatedAt = value;
  }

  get deletedAt(): string {
    return this._deletedAt;
  }

  set deletedAt(value: string) {
    this._deletedAt = value;
  }
}
