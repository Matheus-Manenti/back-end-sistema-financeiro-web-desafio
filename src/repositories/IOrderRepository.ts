import { OrderRequestDTO } from 'src/dtos/order/OrderRequestDTO';

export interface IOrderRepository {
  findById(id: string): Promise<any | null>;
  findAll(orderBy?: any): Promise<any[]>;
  findManyByClientId(clientId: string, orderBy?: any): Promise<any[]>;
  create(data: OrderRequestDTO): Promise<any>;
  update(id: string, data: Record<string, any>): Promise<any>;
}
