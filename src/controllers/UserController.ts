import { UsuarioRequestDTO } from 'src/dtos/user/UserRequestDTO';
import { UserResponseDTO } from 'src/dtos/user/UserResponseDTO';
import { UsersService } from 'src/service/UserService';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { UpdateUserRequestDTO } from 'src/dtos/user/UpdateUserRequestDTO';


@Controller('/api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/create')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: UsuarioRequestDTO): Promise<UserResponseDTO> {
    return this.usersService.createUser(createUserDto);
  }

  @Get('/list-all')
  async findAll(): Promise<UserResponseDTO[]> {
    return this.usersService.findAll();
  }

  @Get('list-by-id/:id')
  async findById(@Param('id') id: string): Promise<UserResponseDTO> {
    return this.usersService.findById(id);
  }

  @Get('list-by-email/:email')
  async findByEmail(@Param('email') email: string): Promise<UserResponseDTO> {
    return this.usersService.findByEmail(email);
  }

  @Patch('update/:id')
  async update(@Param('id') id: string, @Body() data: UpdateUserRequestDTO): Promise<UserResponseDTO> {
    return this.usersService.update(id, data);
  }

  @Patch('update-status/:id')
  async toggleStatus(@Param('id') id: string): Promise<UserResponseDTO> {
    return this.usersService.toggleStatus(id);
  }
}