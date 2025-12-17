import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma.service'; // Importamos Prisma
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    // Configuración básica del Token
    JwtModule.register({
      secret: 'MI_PALABRA_SECRETA_SUPER_SEGURA', // En producción esto va en .env
      signOptions: { expiresIn: '1d' }, // El token dura 1 día
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy],
})
export class AuthModule {}
