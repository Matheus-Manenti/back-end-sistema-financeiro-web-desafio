import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'prisma/UsersModule';
import { AuthController } from 'src/controllers/AuthController';
import { AuthService } from 'src/service/AuthService';
import { JwtStrategy } from './JwtStrategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({

      imports: [ConfigModule], 
      inject: [ConfigService], 
      useFactory: async (configService: ConfigService) => ({

        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' }, 
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}