import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from 'prisma/UsersModule';
import { PrismaModule } from 'prisma/PrismaModule';

@Module({
  imports: [
    PrismaModule, // Importa o módulo do Prisma
    UsersModule,  // Importa o módulo de usuários
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
