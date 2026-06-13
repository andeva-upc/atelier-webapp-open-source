import {BaseResource, BaseResponse} from '../../../shared/infrastructure/base-response';

export interface UserResource extends BaseResource {
  id: string;
  email: string;
  passwordHash: string;
  googleId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  version: bigint;
}

export interface UsersResponse extends BaseResponse {
  users: UserResource[];
}
