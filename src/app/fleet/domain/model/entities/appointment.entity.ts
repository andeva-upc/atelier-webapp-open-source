import { BaseEntity } from '../../../../shared/domain/model/base-entity';

export class Appointment extends BaseEntity {
  private _branchId: string;
  private _customerId: string;
  private _vehicleId: string;
  private _scheduledStart: string;
  private _scheduledEnd: string;
  private _status: string;
  private _notes: string | null;

  constructor(props: {
    id: string;
    branchId: string;
    customerId: string;
    vehicleId: string;
    scheduledStart: string;
    scheduledEnd: string;
    status: string;
    notes: string | null;
  }) {
    super({ id: props.id });
    this._branchId = props.branchId;
    this._customerId = props.customerId;
    this._vehicleId = props.vehicleId;
    this._scheduledStart = props.scheduledStart;
    this._scheduledEnd = props.scheduledEnd;
    this._status = props.status;
    this._notes = props.notes;
  }

  get branchId(): string {
    return this._branchId;
  }

  set branchId(value: string) {
    this._branchId = value;
  }

  get customerId(): string {
    return this._customerId;
  }

  set customerId(value: string) {
    this._customerId = value;
  }

  get vehicleId(): string {
    return this._vehicleId;
  }

  set vehicleId(value: string) {
    this._vehicleId = value;
  }

  get scheduledStart(): string {
    return this._scheduledStart;
  }

  set scheduledStart(value: string) {
    this._scheduledStart = value;
  }

  get scheduledEnd(): string {
    return this._scheduledEnd;
  }

  set scheduledEnd(value: string) {
    this._scheduledEnd = value;
  }

  get status(): string {
    return this._status;
  }

  set status(value: string) {
    this._status = value;
  }

  get notes(): string | null {
    return this._notes;
  }

  set notes(value: string | null) {
    this._notes = value;
  }
}
