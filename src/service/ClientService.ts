import { Injectable, Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { IClientRepository } from 'src/repositories/IClientRepository';
import { ClientResponseDTO } from 'src/dtos/client/ClientResponse';
import { ClientRequestDTO } from 'src/dtos/client/ClientRequestDTO';
import { FinancialStatus } from 'src/dtos/client/FinancialStatus';
import { UpdateClientRequestDTO } from 'src/dtos/client/UpdateClientRequestDTO';
import { ClientConflictException } from 'src/exceptions/client-conflict.exception';
import { ClientNotFoundException } from 'src/exceptions/client-not-found.exception';

@Injectable()
export class ClientService {
  constructor(@Inject('IClientRepository') private readonly clientRepo: IClientRepository) {}

  private readonly clientInclude = {
    orders: true,
  };

  async updateFinancialStatus(id: string, financialStatus: FinancialStatus): Promise<ClientResponseDTO> {
    const updatedClient = await this.clientRepo.update(id, { financialStatus }, this.clientInclude);
    return this._mapToClientResponseDTO(updatedClient);
  }

  private _mapToClientResponseDTO(
    client: Prisma.ClientGetPayload<{ include: { orders: true } }>,
  ): ClientResponseDTO {
    return new ClientResponseDTO({
      ...client,
      financialStatus: client.financialStatus as FinancialStatus,
    });
  }

  private _calculateFinancialStatus(
    client: Prisma.ClientGetPayload<{ include: { orders: true } }>,
  ): FinancialStatus {
    const hasVencidaOrder = client.orders.some((order: any) => {
      const now = new Date();
      let validityStatus: string;
      if (now < order.startDate) {
        validityStatus = 'FUTURA';
      } else if (now > order.endDate && !order.isPaid) {
        validityStatus = 'VENCIDA';
      } else {
        validityStatus = 'VIGENTE';
      }
      return validityStatus === 'VENCIDA';
    });
    return hasVencidaOrder
      ? FinancialStatus.INADIMPLENTE
      : FinancialStatus.ADIMPLENTE;
  }

  async create(data: ClientRequestDTO): Promise<ClientResponseDTO> {
    if (data.email) {
      const existingClient = await this.clientRepo.findByEmail(data.email);
      if (existingClient) {
        throw new ClientConflictException();
      }
    }

    const client = await this.clientRepo.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
    } as any);

    return this._mapToClientResponseDTO(client);
  }

  async findAll(): Promise<ClientResponseDTO[]> {
    const clients = await this.clientRepo.findAll(this.clientInclude, [
      { financialStatus: 'asc' },
      { createdAt: 'desc' },
    ]);
    return clients.map((client) => this._mapToClientResponseDTO(client));
  }

  async findById(id: string): Promise<ClientResponseDTO> {
    const client = await this.clientRepo.findById(id);
    if (!client) {
      throw new ClientNotFoundException();
    }
    return this._mapToClientResponseDTO(client);
  }

  async findByEmail(email: string): Promise<ClientResponseDTO> {
    const client = await this.clientRepo.findByEmail(email);
    if (!client) {
      throw new ClientNotFoundException();
    }
    return this._mapToClientResponseDTO(client);
  }

  async update(
    id: string,
    data: UpdateClientRequestDTO,
  ): Promise<ClientResponseDTO> {

    await this.findById(id);

    if (data.email) {
      const ownerOfEmail = await this.clientRepo.findByEmail(data.email);
      if (ownerOfEmail && ownerOfEmail.id !== id) {
        throw new ClientConflictException();
      }
    }

    const updatedClient = await this.clientRepo.update(id, data as any, this.clientInclude);
    return this._mapToClientResponseDTO(updatedClient);
  }

  async toggleStatus(id: string): Promise<ClientResponseDTO> {
    const client = await this.clientRepo.findById(id);

    if (!client) {
      throw new ClientNotFoundException();
    }

    const updatedClient = await this.clientRepo.update(
      id,
      { isActive: !client.isActive, canceledAt: !client.isActive ? new Date() : null },
      this.clientInclude,
    );

    return this._mapToClientResponseDTO(updatedClient);
  }

  async toggleFinancialStatus(id: string): Promise<ClientResponseDTO> {
    const client = await this.clientRepo.findById(id);
    if (!client) throw new ClientNotFoundException();
    const newStatus = client.financialStatus === 'ADIMPLENTE' ? 'INADIMPLENTE' : 'ADIMPLENTE';
    const updatedClient = await this.clientRepo.update(id, { financialStatus: newStatus }, this.clientInclude);
    return this._mapToClientResponseDTO(updatedClient);
  }
}