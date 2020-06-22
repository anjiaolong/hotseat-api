import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { injectable, inject } from 'tsyringe';

import User from '@domains/users/infra/database/entities/User';
import IUsersRepository from '@domains/users/interfaces/IUsersRepository';
import authConfig from '@config/auth';
import AppError from '@shared/errors/AppError';

interface IRequest {
  email: string;
  password: string;
}

interface IAuthenticationResponse {
  token: string;
  user: User;
}

@injectable()
class AuthenticateUserService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) {}

  async execute({
    email,
    password,
  }: IRequest): Promise<IAuthenticationResponse> {
    const userExists = await this.usersRepository.findByEmail(email);

    const errorMessage = 'Incorrect email/password combination';

    if (!userExists) {
      throw new AppError(errorMessage, 404);
    }

    const passwordMatch = await compare(password, userExists.password);

    if (!passwordMatch) {
      throw new AppError(errorMessage);
    }

    const token = sign(
      {
        sub: userExists.id,
        expiresIn: authConfig.jwt.expiresIn,
      },
      authConfig.jwt.secret,
    );

    return {
      token,
      user: userExists,
    };
  }
}

export default AuthenticateUserService;