import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/PrismaService';
import type { IOrderRepository } from './IOrderRepository';
import { OrderRequestDTO } from 'src/dtos/order/OrderRequestDTO';

@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.order.findUnique({ where: { id } });
  }

  async findAll(orderBy?: any) {
    return this.prisma.order.findMany({ orderBy });
  }

  async findManyByClientId(clientId: string, orderBy?: any) {
    return this.prisma.order.findMany({ where: { clientId }, orderBy });
  }

  async create(data: OrderRequestDTO) {
    return this.prisma.order.create({ data });
  }

  async update(id: string, data: Record<string, any>) {
    return this.prisma.order.update({ where: { id }, data });
  }
}
