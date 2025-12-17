import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

// Definimos una clase simple para recibir los datos (DTO manual)
class LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK) // Para que devuelva status 200 en vez de 201
  @Post('login')
  signIn(@Body() signInDto: LoginDto) {
    return this.authService.login(signInDto.email, signInDto.password);
  }
}
