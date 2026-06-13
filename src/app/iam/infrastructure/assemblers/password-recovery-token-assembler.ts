import {BaseAssembler} from '../../../shared/infrastructure/base-assembler';
import {PasswordRecovery} from '../../domain/model/entities/password-recovery-token.entity';
import {PasswordRecoveryTokensResponse, PasswordRecoveryTokenResource} from '../responses/password-recovery-token-response';

export class PasswordRecoveryTokenAssembler implements BaseAssembler<PasswordRecovery, PasswordRecoveryTokenResource, PasswordRecoveryTokensResponse> {
  toEntityFromResource(resource: PasswordRecoveryTokenResource): PasswordRecovery {
    return new PasswordRecovery({
      id: resource.id,
      tokenHash: resource.tokenHash,
      createdAt: resource.createdAt,
      expiresAt: resource.expiresAt,
      isUsed: resource.isUsed,
      userId: resource.userId
    });
  }

  toResourceFromEntity(entity: PasswordRecovery): PasswordRecoveryTokenResource {
    return {
      id: entity.id,
      tokenHash: entity.tokenHash,
      createdAt: entity.createdAt,
      expiresAt: entity.expiresAt,
      isUsed: entity.isUsed,
      userId: entity.userId
    } as PasswordRecoveryTokenResource;
  }

  toEntitiesFromResponse(response: PasswordRecoveryTokensResponse): PasswordRecovery[] {
      return response.passwordRecoveries.map(resource => this.toEntityFromResource(resource as PasswordRecoveryTokenResource));
  }
}
