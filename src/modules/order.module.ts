import { Module } from '@nestjs/common';
import { OrderController } from 'src/controllers/OrderController';
import { OrderService } from 'src/service/OrderService';
import { ClientsModule } from 'prisma/ClientModule';
import { PrismaOrderRepository } from 'src/repositories/PrismaOrderRepository';

@Module({
  imports: [ClientsModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    PrismaOrderRepository,
    { provide: 'IOrderRepository', useClass: PrismaOrderRepository },
  ],
})
export class OrderModule {}
