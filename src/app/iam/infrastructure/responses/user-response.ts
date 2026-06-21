import {BaseResource, BaseResponse} from '../../../shared/infrastructure/base-response';

export interface UserResource extends BaseResource {
  id: string;
  email: string;
}

export interface UsersResponse extends BaseResponse {
  users: UserResource[];
}
