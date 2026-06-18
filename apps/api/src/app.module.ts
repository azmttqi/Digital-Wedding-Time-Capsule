import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PhotosModule } from './photos/photos.module';
import { GuestbookModule } from './guestbook/guestbook.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [PrismaModule, PhotosModule, GuestbookModule, EventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
