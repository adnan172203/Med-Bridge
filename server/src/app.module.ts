import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdentityModule } from './identity/identity.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './identity/users/entities/user.entity';
import { Patient } from './identity/patients/entities/patient.entity';
import { AppointmentsModule } from './appointments/appointments.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      entities: [User, Patient],
      synchronize: true, // Set to false in production
    }),
    IdentityModule,
    AppointmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
