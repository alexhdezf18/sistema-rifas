import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Habilitar CORS (Permite que el frontend se conecte desde otro dominio)
  app.enableCors();

  // 2. Usar el puerto que nos de la nube O el 3000 si estamos en local
  const port = process.env.PORT || 3000;

  await app.listen(port);
  console.log(`🚀 Server running on port ${port}`);
}
bootstrap();
