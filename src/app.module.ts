import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AnalisisModule } from './analisis/analisis.module';

@Module({
  imports: [PrismaModule, AnalisisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
