import {BaseAssembler} from '../../../shared/infrastructure/base-assembler';
import {User} from '../../domain/model/entities/user.entity';
import {UserResource, UsersResponse} from '../responses/user-response';

export class UserAssembler implements BaseAssembler<User, UserResource, UsersResponse>{
  toEntityFromResource(resource: UserResource): User {
    return new User({
      id: resource.id,
      email: resource.email
    });
  }

  toResourceFromEntity(entity: User): UserResource {
    return {
      id: entity.id as string,
      email: entity.email
    } as UserResource;
  }

  toEntitiesFromResponse(response: UsersResponse): User[] {
    return response.users.map(resource => this.toEntityFromResource(resource as UserResource));
  }
}
