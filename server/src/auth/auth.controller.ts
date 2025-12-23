// server/src/auth/auth.controller.ts (Ejemplo rápido)
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    // Validamos credenciales
    const user = await this.authService.validateUser(body.email, body.password);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generamos token
    return this.authService.login(user);
  }
}
