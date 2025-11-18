import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // Conecta-se ao banco de dados quando o módulo é inicializado
    await this.$connect();
  }

  async onModuleDestroy() {
    // Desconecta-se do banco de dados quando a aplicação é encerrada
    await this.$disconnect();
  }
}