import {BaseEntity} from '../../../../shared/domain/model/base-entity';

export class User extends BaseEntity {
  private _email: string;
  private _passwordHash: string;
  private _googleId: string;
  private _status: string;
  private _createdAt: string;
  private _updatedAt: string;
  private _deletedAt: string
  private _version: bigint;

  constructor(props: {id: string, email: string, passwordHash: string, googleId: string, status: string, createdAt: string, updatedAt: string, deletedAt: string, version: bigint}) {
    super({id: props.id});
    this._email = props.email;
    this._passwordHash = props.passwordHash;
    this._googleId = props.googleId;
    this._status = props.status;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._deletedAt = props.deletedAt;
    this._version = props.version;
  }


  get email(): string {
    return this._email;
  }

  set email(value: string) {
    this._email = value;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  set passwordHash(value: string) {
    this._passwordHash = value;
  }

  get googleId(): string {
    return this._googleId;
  }

  set googleId(value: string) {
    this._googleId = value;
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

  get version(): bigint {
    return this._version;
  }

  set version(value: bigint) {
    this._version = value;
  }
}
