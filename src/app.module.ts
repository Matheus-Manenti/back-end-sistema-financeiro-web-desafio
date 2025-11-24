import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from 'prisma/UsersModule';
import { ClientsModule } from 'prisma/ClientModule';
import { PrismaModule } from 'prisma/PrismaModule';
import { AuthModule } from './auth/AuthModule';
import { OrderModule } from './modules/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    PrismaModule,  
    UsersModule,  
    ClientsModule, 
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
