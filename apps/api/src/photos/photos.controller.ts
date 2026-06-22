import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PhotosService } from './photos.service';

@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post()
  async createPhoto(@Body() body: { eventSlug: string; url: string; uploaderName?: string; missionId?: string; caption?: string }) {
    return this.photosService.createPhotoRecord(body);
  }

  @Get('stats/count')
  async getStats(@Query('range') range?: string) {
    const validRange = range === 'all' ? 'all' : 'today';
    const count = await this.photosService.getCapturesCount(validRange);
    return { count };
  }

  @Get(':eventSlug')
  async getPhotos(@Param('eventSlug') eventSlug: string, @Query('status') status?: string) {
    return this.photosService.getEventPhotos(eventSlug, status);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: 'APPROVED' | 'REJECTED' }) {
    return this.photosService.updatePhotoStatus(id, body.status);
  }
}
