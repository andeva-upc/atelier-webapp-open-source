import {BaseResource, BaseResponse} from '../../../shared/infrastructure/base-response';

export interface PasswordRecoveryTokenResource extends BaseResource {
  id: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
  isUsed: boolean;
  userId: string;
}

export interface PasswordRecoveryTokensResponse extends BaseResponse {
  passwordRecoveries: PasswordRecoveryTokenResource[];
}
