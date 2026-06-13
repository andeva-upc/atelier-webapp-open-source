import {BaseEntity} from '../../../../shared/domain/model/base-entity';

export class PasswordRecovery extends BaseEntity {
  private _tokenHash: string;
  private _createdAt: string;
  private _expiresAt: string;
  private _isUsed: boolean;
  private _userId: string;

  constructor(props: {id: string, tokenHash: string, createdAt: string, expiresAt: string, isUsed: boolean, userId: string}) {
    super({id: props.id});
    this._tokenHash = props.tokenHash;
    this._createdAt = props.createdAt;
    this._expiresAt = props.expiresAt;
    this._isUsed = props.isUsed;
    this._userId = props.userId;
  }


  get tokenHash(): string {
    return this._tokenHash;
  }

  set tokenHash(value: string) {
    this._tokenHash = value;
  }

  get createdAt(): string {
    return this._createdAt;
  }

  set createdAt(value: string) {
    this._createdAt = value;
  }

  get expiresAt(): string {
    return this._expiresAt;
  }

  set expiresAt(value: string) {
    this._expiresAt = value;
  }

  get isUsed(): boolean {
    return this._isUsed;
  }

  set isUsed(value: boolean) {
    this._isUsed = value;
  }

  get userId(): string {
    return this._userId;
  }

  set userId(value: string) {
    this._userId = value;
  }
}
