import {BaseEntity} from '../../../../shared/domain/model/base-entity';

export class BranchSubscription extends BaseEntity {
  private _branchId: string;
  private _planId: string;
  private _billingCycle: string;
  private _status: string;
  private _startDate: string;
  private _endDate: string;

  constructor(props: {id: string, branchId: string, planId: string, billingCycle: string, status: string, startDate: string, endDate: string}) {
    super({id: props.id});
    this._branchId = props.branchId;
    this._planId = props.planId;
    this._billingCycle = props.billingCycle;
    this._status = props.status;
    this._startDate = props.startDate;
    this._endDate = props.endDate;
  }

  get branchId(): string {
    return this._branchId;
  }

  set branchId(value: string) {
    this._branchId = value;
  }

  get planId(): string {
    return this._planId;
  }

  set planId(value: string) {
    this._planId = value;
  }

  get billingCycle(): string {
    return this._billingCycle;
  }

  set billingCycle(value: string) {
    this._billingCycle = value;
  }

  get status(): string {
    return this._status;
  }

  set status(value: string) {
    this._status = value;
  }

  get startDate(): string {
    return this._startDate;
  }

  set startDate(value: string) {
    this._startDate = value;
  }

  get endDate(): string {
    return this._endDate;
  }

  set endDate(value: string) {
    this._endDate = value;
  }
}
