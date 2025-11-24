import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './UserService';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { LoginDto } from 'src/dtos/auth/LoginDto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<Omit<User, 'passwordHash'> | null> {
  const user = await this.usersService.findUserByEmailForAuth(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.pas_word);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas. Verifique seu email e senha.');
    }
    const payload = { username: user.email, sub: user.id, roles: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
