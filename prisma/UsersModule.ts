import { Module } from '@nestjs/common';
import { UsersController } from 'src/controllers/UserController';
import { UsersService } from 'src/service/UserService';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Exporta o UsersService para ser usado em outros módulos
})
export class UsersModule {}