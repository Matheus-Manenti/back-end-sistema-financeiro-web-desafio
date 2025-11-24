import { ClientRequestDTO } from 'src/dtos/client/ClientRequestDTO';

export interface IClientRepository {
  findByEmail(email: string): Promise<any | null>;
  findById(id: string): Promise<any | null>;
  findAll(include?: any, orderBy?: any): Promise<any[]>;
  create(data: ClientRequestDTO): Promise<any>;
  update(id: string, data: Record<string, any>, include?: any): Promise<any>;
}
