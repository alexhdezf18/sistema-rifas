// server/src/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // <--- ESTA ES LA CLAVE: Lo hace disponible en toda la app
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // <--- Decimos: "Quien importe este módulo, puede usar PrismaService"
})
export class PrismaModule {}
