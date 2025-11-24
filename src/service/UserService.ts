import { Injectable, Inject } from '@nestjs/common';
import { hash } from 'bcrypt';
import { UsuarioRequestDTO } from '../dtos/user/UserRequestDTO';
import { UserResponseDTO } from '../dtos/user/UserResponseDTO';
import { UpdateUserRequestDTO } from 'src/dtos/user/UpdateUserRequestDTO';
import { UserNotFoundException } from 'src/exceptions/user-not-found.exception';
import { UserConflictException } from 'src/exceptions/user-conflict.exception';
import { Role } from '@prisma/client';
import type { IUserRepository } from 'src/repositories/IUserRepository';

@Injectable()
export class UsersService {
  constructor(@Inject('IUserRepository') private readonly usersRepo: IUserRepository) {}

  private readonly userSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  };

  async createUser(data: UsuarioRequestDTO): Promise<UserResponseDTO> {

    const existingUser = await this.usersRepo.findByEmail(data.email);

    if (existingUser) {
      throw new UserConflictException();
    }

    const saltRounds = 10;
    const passwordHash = await hash(data.password, saltRounds);

    const newUser = await this.usersRepo.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role.toUpperCase() as Role,
    } as any);

    const response = new UserResponseDTO({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    });

    return response;
  }

  async findAll(): Promise<UserResponseDTO[]> {
    const users = await this.usersRepo.findAll(this.userSelect);
    return users.map(user => new UserResponseDTO(user as any));
  }

  async findById(id: string): Promise<UserResponseDTO> {
    const user = await this.usersRepo.findById(id);
    if (!user) {
      throw new UserNotFoundException();
    }
    const selected = (({ id, name, email, role, isActive, createdAt, updatedAt }) => ({ id, name, email, role, isActive, createdAt, updatedAt }))(user as any);
    return new UserResponseDTO(selected as any);
  }

  async findByEmail(email: string): Promise<UserResponseDTO> {
    const user = await this.usersRepo.findByEmail(email);
    if (!user) {
      throw new UserNotFoundException();
    }
    const selected = (({ id, name, email, role, isActive, createdAt, updatedAt }) => ({ id, name, email, role, isActive, createdAt, updatedAt }))(user as any);
    return new UserResponseDTO(selected as any);
  }

  async findUserByEmailForAuth(email: string) {
    const user = await this.usersRepo.findByEmail(email);
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }

  async update(id: string, data: UpdateUserRequestDTO): Promise<UserResponseDTO> {

    console.log('Dados recebidos para atualização:', data);

    await this.findById(id); 

    if (data.email) {
      const ownerOfEmail = await this.usersRepo.findByEmail(data.email);

      if (ownerOfEmail && ownerOfEmail.id !== id) {
        throw new UserConflictException();
      }
    }

    const updateData: any = { ...data };

    if (data.password) {
      updateData.passwordHash = await hash(data.password, 10); 
      delete updateData.password; 
    }

    if (data.role) {
      updateData.role = data.role.toUpperCase() as Role;
    }

    delete updateData.password; 

    const updatedUser = await this.usersRepo.update(id, updateData, this.userSelect);
    return new UserResponseDTO(updatedUser as any);
  }

  async toggleStatus(id: string): Promise<UserResponseDTO> {

    const user = await this.findById(id);
    
    const updatedUser = await this.usersRepo.update(id, { isActive: !user.isActive }, this.userSelect);
    return new UserResponseDTO(updatedUser as any);
  }
}
