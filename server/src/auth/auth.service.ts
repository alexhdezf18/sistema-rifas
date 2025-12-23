import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    // 1. Buscar al admin por email
    const user = await this.prisma.admin.findUnique({ where: { email } });

    // 2. Si existe, comparar contraseñas
    if (user && (await bcrypt.compare(pass, user.password))) {
      // 3. Si coinciden, quitamos el password del objeto y lo devolvemos
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: any) {
    // Generamos el token real
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        email: user.email,
        name: user.name,
      },
    };
  }
}
