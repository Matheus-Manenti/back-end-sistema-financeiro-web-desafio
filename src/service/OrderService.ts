import { Injectable } from '@nestjs/common';
import { Order } from '@prisma/client';
import { PrismaService } from 'prisma/PrismaService';
import { OrderRequestDTO } from '../dtos/order/OrderRequestDTO';
import { OrderResponseDTO } from '../dtos/order/OrderResponseDTO';
import { UpdateOrderRequestDTO } from '../dtos/order/UpdateOrderRequestDTO';
import { ValidityStatus } from '../dtos/order/ValidityStatus';
import { OrderNotFoundException } from '../exceptions/order-not-found.exception';
import { ClientService } from './ClientService';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clientService: ClientService,
  ) {}

  private _calculateValidityStatus(order: Order): ValidityStatus {
    const now = new Date();
    if (now < order.startDate) {
      return ValidityStatus.FUTURA;
    } else if (now > order.endDate) {
      return ValidityStatus.VENCIDA;
    } else {
      return ValidityStatus.VIGENTE;
    }
  }

  private _mapToOrderResponseDTO(order: Order): OrderResponseDTO {
    const validityStatus = this._calculateValidityStatus(order);
    return new OrderResponseDTO(order, validityStatus);
  }

  async create(data: OrderRequestDTO): Promise<OrderResponseDTO> {
    
    await this.clientService.findById(data.clientId);

    const order = await this.prisma.order.create({
      data: {
        description: data.description,
        value: data.value,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isPaid: data.isPaid,
        clientId: data.clientId,
      },
    });

    return this._mapToOrderResponseDTO(order);
  }

  async findAll(): Promise<OrderResponseDTO[]> {
    const orders = await this.prisma.order.findMany({
      orderBy: {
        isActive: 'desc',
      },
    });
    return orders.map((order) => this._mapToOrderResponseDTO(order));
  }

  async findByClientId(clientId: string): Promise<OrderResponseDTO[]> {

    await this.clientService.findById(clientId);

    const orders = await this.prisma.order.findMany({
      where: {
        clientId: clientId,
      },
      orderBy: {
        isActive: 'desc',
      },
    });

    return orders.map((order) => this._mapToOrderResponseDTO(order));
  }

  async findById(id: string): Promise<OrderResponseDTO> {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new OrderNotFoundException();
    }

    return this._mapToOrderResponseDTO(order);
  }

  async togglePaymentStatus(id: string): Promise<OrderResponseDTO> {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new OrderNotFoundException();
    }

    const newPaymentStatus = !order.isPaid;

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        isPaid: newPaymentStatus,
        paidAt: newPaymentStatus ? new Date() : null,
      },
    });

    return this._mapToOrderResponseDTO(updatedOrder);
  }

  async update(
    id: string,
    data: UpdateOrderRequestDTO,
  ): Promise<OrderResponseDTO> {
    await this.findById(id);
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });

    return this._mapToOrderResponseDTO(updatedOrder);
  }

  async toggleActivity(id: string): Promise<OrderResponseDTO> {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new OrderNotFoundException();
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { isActive: !order.isActive },
    });

    return this._mapToOrderResponseDTO(updatedOrder);
  }
}
