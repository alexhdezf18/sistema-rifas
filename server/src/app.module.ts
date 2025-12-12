import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RafflesModule } from './raffles/raffles.module';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [PrismaModule, RafflesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
