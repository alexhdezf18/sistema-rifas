import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitamos CORS para que el Frontend pueda pedir datos
  app.enableCors();

  await app.listen(3000);
}
bootstrap();
