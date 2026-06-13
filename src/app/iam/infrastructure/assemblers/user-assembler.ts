import {BaseAssembler} from '../../../shared/infrastructure/base-assembler';
import {User} from '../../domain/model/entities/user.entity';
import {UserResource, UsersResponse} from '../responses/user-response';

export class UserAssembler implements BaseAssembler<User, UserResource, UsersResponse>{
  toEntityFromResource(resource: UserResource): User {
    return new User({
      id: resource.id,
      email: resource.email,
      passwordHash: resource.passwordHash,
      googleId: resource.googleId,
      status: resource.status,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
      deletedAt: resource.deletedAt,
      version: BigInt(resource.version)
    });
  }

  toResourceFromEntity(entity: User): UserResource {
    return {
      id: entity.id,
      email: entity.email,
      passwordHash: entity.passwordHash,
      googleId: entity.googleId,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      version: BigInt(entity.version)
    } as UserResource;
  }

  toEntitiesFromResponse(response: UsersResponse): User[] {
    return response.users.map(resource => this.toEntityFromResource(resource as UserResource));
  }
}
