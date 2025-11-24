import { Injectable, Inject } from '@nestjs/common';
import { Order } from '@prisma/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { OrderRequestDTO } from '../dtos/order/OrderRequestDTO';
import { OrderResponseDTO } from '../dtos/order/OrderResponseDTO';
import { UpdateOrderRequestDTO } from '../dtos/order/UpdateOrderRequestDTO';
import { ValidityStatus } from '../dtos/order/ValidityStatus';
import { OrderNotFoundException } from '../exceptions/order-not-found.exception';
import { ClientService } from './ClientService';
import { FinancialStatus } from 'src/dtos/client/FinancialStatus';
import type { IOrderRepository } from 'src/repositories/IOrderRepository';

@Injectable()
export class OrderService {
  constructor(
    @Inject('IOrderRepository') private readonly orderRepo: IOrderRepository,
    private readonly clientService: ClientService,
    @Inject('IClientRepository') private readonly clientRepo?: any,
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

    const order = await this.orderRepo.create({
      description: data.description,
      value: data.value,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      isPaid: data.isPaid,
      clientId: data.clientId,
    } as any);

    await this._updateClientFinancialStatus(data.clientId);

    return this._mapToOrderResponseDTO(order);
  }

  async findAll(): Promise<OrderResponseDTO[]> {
    const orders = await this.orderRepo.findAll({ orderBy: { isActive: 'desc' } });
    return orders.map((order) => this._mapToOrderResponseDTO(order));
  }

  async findById(id: string): Promise<OrderResponseDTO> {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new OrderNotFoundException();
    }
    return this._mapToOrderResponseDTO(order);
  }

  async togglePaymentStatus(id: string): Promise<OrderResponseDTO> {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new OrderNotFoundException();
    }

    const newPaymentStatus = !order.isPaid;

    const updatedOrder = await this.orderRepo.update(id, {
      isPaid: newPaymentStatus,
      paidAt: newPaymentStatus ? new Date() : null,
    });

    await this._updateClientFinancialStatus(updatedOrder.clientId);
    return this._mapToOrderResponseDTO(updatedOrder);
  }

  async update(
    id: string,
    data: UpdateOrderRequestDTO,
  ): Promise<OrderResponseDTO> {
    await this.findById(id);
    const updatedOrder = await this.orderRepo.update(id, {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    } as any);

    await this._updateClientFinancialStatus(updatedOrder.clientId);
    return this._mapToOrderResponseDTO(updatedOrder);
  }

  async toggleActivity(id: string): Promise<OrderResponseDTO> {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new OrderNotFoundException();
    }

    const updatedOrder = await this.orderRepo.update(id, { isActive: !order.isActive });

    await this._updateClientFinancialStatus(updatedOrder.clientId);
    return this._mapToOrderResponseDTO(updatedOrder);
  }

  async findByClientId(clientId: string): Promise<OrderResponseDTO[]> {
    const orders = await this.orderRepo.findManyByClientId(clientId, { orderBy: { startDate: 'asc' } });

    return orders.map((order) => {
      const orderDTO = this._mapToOrderResponseDTO(order);

      orderDTO.startDateFormatted = format(new Date(order.startDate), 'dd/MM/yyyy', { locale: ptBR });
      orderDTO.endDateFormatted = format(new Date(order.endDate), 'dd/MM/yyyy', { locale: ptBR });
      return orderDTO;
    });
  }

  async listAllWithDashboardData(): Promise<{ orders: OrderResponseDTO[]; dashboard: any }> {
    const orders = await this.orderRepo.findAll();

    const totalOrders = orders.length;
    const totalPaid = orders.filter(order => order.isPaid).length;
    const totalUnpaid = totalOrders - totalPaid;

    const totalPaidValue = orders
      .filter(order => order.isPaid)
      .reduce((sum, order) => sum + order.value, 0);

    const totalUnpaidValue = orders
      .filter(order => !order.isPaid)
      .reduce((sum, order) => sum + order.value, 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const totalReceivedThisMonth = orders
      .filter(order => order.isPaid && order.endDate && new Date(order.endDate).getMonth() === currentMonth && new Date(order.endDate).getFullYear() === currentYear)
      .reduce((sum, order) => sum + order.value, 0);

    const dashboard = {
      totalOrders,
      totalPaid,
      totalUnpaid,
      paidPercentage: totalOrders > 0 ? (totalPaid / totalOrders) * 100 : 0,
      unpaidPercentage: totalOrders > 0 ? (totalUnpaid / totalOrders) * 100 : 0,
      totalPaidValue,
      totalUnpaidValue,
      totalReceivedThisMonth,
    };

    const orderDTOs = orders.map(order => this._mapToOrderResponseDTO(order));

    return { orders: orderDTOs, dashboard };
  }

  private async _updateClientFinancialStatus(clientId: string) {
    // Use client repository to fetch client with orders
    const client = await this.clientRepo.findById(clientId);
    if (!client) return;

    const now = new Date();
    const hasVencidaOrder = client.orders.some((order: any) => {
      const isVencida = now > order.endDate && !order.isPaid;
      return isVencida;
    });

    const financialStatus = hasVencidaOrder ? FinancialStatus.INADIMPLENTE : FinancialStatus.ADIMPLENTE;
    await this.clientService.updateFinancialStatus(clientId, financialStatus);
  }
}
