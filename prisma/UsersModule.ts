import { Module } from '@nestjs/common';
import { UsersController } from 'src/controllers/UserController';
import { UsersService } from 'src/service/UserService';
import { PrismaUserRepository } from 'src/repositories/PrismaUserRepository';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    PrismaUserRepository,
    { provide: 'IUserRepository', useClass: PrismaUserRepository },
  ],
  exports: [UsersService],
})
export class UsersModule {}