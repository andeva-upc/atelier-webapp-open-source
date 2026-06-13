import {BaseEntity} from '../../../../shared/domain/model/base-entity';

export class Workshop extends BaseEntity {
  private _ownerId: string;
  private _businessName: string;
  private _brandName: string;
  private _taxId: string;
  private _mileageIntervalConfig: number;

  constructor(props: {id: string, ownerId: string, businessName: string, brandName: string, taxId: string, mileageIntervalConfig: number}) {
    super({id: props.id});
    this._ownerId = props.ownerId;
    this._businessName = props.businessName;
    this._brandName = props.brandName;
    this._taxId = props.taxId;
    this._mileageIntervalConfig = props.mileageIntervalConfig;
  }

  get ownerId(): string {
    return this._ownerId;
  }

  set ownerId(value: string) {
    this._ownerId = value;
  }

  get businessName(): string {
    return this._businessName;
  }

  set businessName(value: string) {
    this._businessName = value;
  }

  get brandName(): string {
    return this._brandName;
  }

  set brandName(value: string) {
    this._brandName = value;
  }

  get taxId(): string {
    return this._taxId;
  }

  set taxId(value: string) {
    this._taxId = value;
  }

  get mileageIntervalConfig(): number {
    return this._mileageIntervalConfig;
  }

  set mileageIntervalConfig(value: number) {
    this._mileageIntervalConfig = value;
  }
}
