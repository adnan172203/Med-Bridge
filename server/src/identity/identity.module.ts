import { Module } from '@nestjs/common';
import { AuthService } from './users/iam/authentication/auth.service';
import { AuthController } from './users/iam/authentication/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './users/iam/config/jwt.config';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './users/iam/authentication/guards/authentication.guard';
import { AccessTokenGuard } from './users/iam/authentication/guards/access-token.guard';
import { RefreshTokenIdsStorage } from './users/iam/authentication/refresh-token-storage/refresh-token-ids.storage';
import { RolesGuard } from './users/iam/authorization/guards/role.guard';
import { UserManagementController } from './users/user-management/user-management.controller';
import { UserManagementService } from './users/user-management/user-management.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    AuthService,
    UserManagementService,
    RefreshTokenIdsStorage,
    AccessTokenGuard,
  ],
  controllers: [AuthController, UserManagementController],
})
export class IdentityModule {}
