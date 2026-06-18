import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PhotosModule } from './photos/photos.module';

@Module({
  imports: [PrismaModule, PhotosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
