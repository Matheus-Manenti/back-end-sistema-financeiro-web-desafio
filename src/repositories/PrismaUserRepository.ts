import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/PrismaService';
import type { IUserRepository } from './IUserRepository';
import { UsuarioRequestDTO } from 'src/dtos/user/UserRequestDTO';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findAll(select?: any) {
    return this.prisma.user.findMany({ select });
  }

  async create(data: UsuarioRequestDTO & { passwordHash: string }) {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: Record<string, any>, select?: any) {
    return this.prisma.user.update({ where: { id }, data, select });
  }
}
