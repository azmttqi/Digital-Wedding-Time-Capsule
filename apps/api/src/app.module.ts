import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PhotosModule } from './photos/photos.module';
import { GuestbookModule } from './guestbook/guestbook.module';
import { EventsModule } from './events/events.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    PrismaModule, 
    PhotosModule, 
    GuestbookModule, 
    EventsModule,
    UploadModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
