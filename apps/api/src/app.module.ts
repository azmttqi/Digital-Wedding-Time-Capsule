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
import { TasksModule } from './tasks/tasks.module';

import { existsSync, mkdirSync } from 'fs';
import * as process from 'process';

const uploadPath = process.env.VERCEL ? '/tmp/uploads' : join(__dirname, '..', 'uploads');
if (!existsSync(uploadPath)) {
  mkdirSync(uploadPath, { recursive: true });
}

@Module({
  imports: [
    PrismaModule, 
    PhotosModule, 
    GuestbookModule, 
    EventsModule,
    UploadModule,
    TasksModule,
    ServeStaticModule.forRoot({
      rootPath: uploadPath,
      serveRoot: '/uploads',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
