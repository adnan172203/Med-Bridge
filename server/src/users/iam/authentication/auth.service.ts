import {
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Role } from '../../enums/role.enum';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';

import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RefreshTokenIdsStorage } from './refresh-token-storage/refresh-token-ids.storage';
import { InvalidateRefreshTokenError } from './errors/invalidate-refresh-token.error';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignupDto } from './dto/auth.dto';
import { Response } from 'express';
dotenv.config();

interface SigninParams {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
  ) {}

  async signUp({
    name,
    email,
    password,
    address,
    role,
    phoneNumber,
  }: SignupDto) {
    const userExists = await this.userRepository.findOne({ where: { email } });

    if (userExists) {
      throw new HttpException('Username or email already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      address,
      role: role as Role,
      phoneNumber,
    });

    const savedUser = await this.userRepository.save(user);

    // return this.generateJWT(name, savedUser.id);
    return await this.generateTokens(savedUser);
  }
  async signIn(res: Response, { email, password }: SigninParams) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      throw new HttpException('Invalid credentials', 400);
    }

    const hashedPassword = user.password;

    const isValidPassword = await bcrypt.compare(password, hashedPassword);

    if (!isValidPassword) {
      throw new HttpException('Invalid credentials', 400);
    }

    // return this.generateJWT(user.name, user.id);
    if (user && user.role) {
      return await this.generateTokens(user, res);
    } else {
      throw new Error('User role is not defined');
    }
  }

  async generateTokens(user: User, res?: Response) {
    const refreshTokenId = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        { email: user.email, role: user.role },
      ),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl, {
        refreshTokenId,
      }),
    ]);
    await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId);
    // return {
    //   accessToken,
    //   refreshToken,
    // };

    if (!res) {
      return {
        accessToken,
        refreshToken,
      };
    }

    // Set cookies
    res.cookie('access_token', accessToken, {
      // httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
      // sameSite: 'strict',
      maxAge: this.jwtConfiguration.accessTokenTtl * 100000, // Convert to milliseconds
    });

    res.cookie('refresh_token', refreshToken, {
      // httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: this.jwtConfiguration.refreshTokenTtl * 100000,
      path: '/auth/refresh', // Only send cookie to refresh endpoint
    });

    return res.send({ accessToken });
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
      >(refreshTokenDto.refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });
      const user = await this.userRepository.findOneOrFail({
        where: { id: sub },
      });
      const isValid = await this.refreshTokenIdsStorage.validate(
        user.id,
        refreshTokenId,
      );
      if (isValid) {
        await this.refreshTokenIdsStorage.invalidate(user.id);
      } else {
        throw new Error('Refresh Token is invalid');
      }
      return this.generateTokens(user);
    } catch (err) {
      if (err instanceof InvalidateRefreshTokenError) {
        throw new UnauthorizedException('Access denied');
      }
      throw new UnauthorizedException();
    }
  }

  private async signToken<T>(userId: string, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }
}
