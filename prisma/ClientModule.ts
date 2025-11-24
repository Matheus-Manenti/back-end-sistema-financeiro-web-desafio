import { Module } from '@nestjs/common';
import { ClientController } from 'src/controllers/ClientController';
import { ClientService } from 'src/service/ClientService';
import { PrismaClientRepository } from 'src/repositories/PrismaClientRepository';

@Module({
  controllers: [ClientController],
  providers: [
    ClientService,
    PrismaClientRepository,
    { provide: 'IClientRepository', useClass: PrismaClientRepository },
  ],
  exports: [ClientService],
})
export class ClientsModule {}