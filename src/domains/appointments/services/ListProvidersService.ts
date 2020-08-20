import { injectable, inject } from 'tsyringe';

import User from '@domains/users/infra/database/entities/User';
import IUsersRepository from '@domains/users/interfaces/IUsersRepository';
import ICacheProvider from '@shared/container/providers/CacheProvider/interfaces/ICacheProvider';

interface IRequest {
  exceptUserId: string;
}
@injectable()
class ListProvidersService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) {}

  public async execute({ exceptUserId }: IRequest): Promise<User[]> {
    const providersListCacheKey = `providers-list:${exceptUserId}`;

    let providers = await this.cacheProvider.get<User[]>(providersListCacheKey);

    if (!providers) {
      providers = await this.usersRepository.findProviders({
        exceptUserId,
      });

      await this.cacheProvider.save<User[]>(providersListCacheKey, providers);
    }

    return providers;
  }
}

export default ListProvidersService;
