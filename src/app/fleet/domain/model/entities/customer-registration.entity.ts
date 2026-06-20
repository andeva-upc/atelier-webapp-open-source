import { BaseEntity } from '../../../../shared/domain/model/base-entity';

export class CustomerRegistration extends BaseEntity {
  private _customerId: string;
  private _branchId: string;
  private _status: string;
  private _createdAt: string;
  private _deletedAt: string | null;

  constructor(props: {
    id: string;
    customerId: string;
    branchId: string;
    status: string;
    createdAt: string;
    deletedAt: string | null;
  }) {
    super({ id: props.id });
    this._customerId = props.customerId;
    this._branchId = props.branchId;
    this._status = props.status;
    this._createdAt = props.createdAt;
    this._deletedAt = props.deletedAt;
  }

  get customerId(): string {
    return this._customerId;
  }

  set customerId(value: string) {
    this._customerId = value;
  }

  get branchId(): string {
    return this._branchId;
  }

  set branchId(value: string) {
    this._branchId = value;
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

  get deletedAt(): string | null {
    return this._deletedAt;
  }

  set deletedAt(value: string | null) {
    this._deletedAt = value;
  }
}
