import { UsuarioRequestDTO } from 'src/dtos/user/UserRequestDTO';
import { UserResponseDTO } from 'src/dtos/user/UserResponseDTO';
import { UsersService } from 'src/service/UserService';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UpdateUserRequestDTO } from 'src/dtos/user/UpdateUserRequestDTO';
import { JwtAuthGuard } from 'src/auth/JwtAuthGuard';
import { Role } from '@prisma/client'; 
import { RolesGuard } from 'src/auth/RolesGuard';
import { Roles } from 'src/auth/RolesDecorator';

@UseGuards(JwtAuthGuard, RolesGuard) 
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/create')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN) 
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: UsuarioRequestDTO): Promise<UserResponseDTO> {
    return this.usersService.createUser(createUserDto);
  }

  @Get('/list-all')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN) 
  async findAll(): Promise<UserResponseDTO[]> {
    return this.usersService.findAll();
  }

  @Get('list-by-id/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async findById(@Param('id') id: string): Promise<UserResponseDTO> {
    return this.usersService.findById(id);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get('list-by-email/:email')
  async findByEmail(@Param('email') email: string): Promise<UserResponseDTO> {
    return this.usersService.findByEmail(email);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Patch('update/:id')
  async update(@Param('id') id: string, @Body() data: UpdateUserRequestDTO): Promise<UserResponseDTO> {
    return this.usersService.update(id, data);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Patch('update-status/:id')
  async toggleStatus(@Param('id') id: string): Promise<UserResponseDTO> {
    return this.usersService.toggleStatus(id);
  }
}