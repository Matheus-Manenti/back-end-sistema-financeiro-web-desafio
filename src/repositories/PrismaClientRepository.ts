import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/PrismaService';
import type { IClientRepository } from './IClientRepository';
import { ClientRequestDTO } from 'src/dtos/client/ClientRequestDTO';

@Injectable()
export class PrismaClientRepository implements IClientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.client.findUnique({ where: { email }, include: { orders: true } });
  }

  async findById(id: string) {
    return this.prisma.client.findUnique({ where: { id }, include: { orders: true } });
  }

  async findAll(include?: any, orderBy?: any) {
    return this.prisma.client.findMany({ include, orderBy });
  }

  async create(data: ClientRequestDTO) {
    return this.prisma.client.create({ data, include: { orders: true } });
  }

  async update(id: string, data: Record<string, any>, include?: any) {
    return this.prisma.client.update({ where: { id }, data, include });
  }
}
