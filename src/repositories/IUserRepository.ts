import { UsuarioRequestDTO } from 'src/dtos/user/UserRequestDTO';

export interface IUserRepository {
  findByEmail(email: string): Promise<any | null>;
  findById(id: string): Promise<any | null>;
  findAll(select?: any): Promise<any[]>;
  create(data: UsuarioRequestDTO & { passwordHash: string }): Promise<any>;
  update(id: string, data: Record<string, any>, select?: any): Promise<any>;
}
