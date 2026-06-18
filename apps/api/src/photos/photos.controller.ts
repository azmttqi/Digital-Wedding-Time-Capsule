import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PhotosService } from './photos.service';

@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post()
  async createPhoto(@Body() body: { eventSlug: string; url: string; uploaderName?: string; missionId?: string }) {
    return this.photosService.createPhotoRecord(body);
  }

  @Get(':eventSlug')
  async getPhotos(@Param('eventSlug') eventSlug: string, @Query('status') status: string) {
    if (status === 'PENDING') {
      return this.photosService.getPendingPhotos(eventSlug);
    }
    return this.photosService.getApprovedPhotos(eventSlug);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: 'APPROVED' | 'REJECTED' }) {
    return this.photosService.updatePhotoStatus(id, body.status);
  }
}
