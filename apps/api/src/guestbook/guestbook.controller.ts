import { Body, Controller, Get, Param, Post, Patch } from '@nestjs/common';
import { GuestbookService } from './guestbook.service';

@Controller('guestbook')
export class GuestbookController {
  constructor(private readonly guestbookService: GuestbookService) {}

  @Post()
  async createEntry(@Body() body: { eventSlug: string; name: string; message?: string; attendanceCount: number }) {
    return this.guestbookService.createEntry(body);
  }

  @Get(':eventSlug')
  async getEntries(@Param('eventSlug') eventSlug: string) {
    return this.guestbookService.getEntries(eventSlug);
  }

  @Get('entry/:id')
  async getEntryById(@Param('id') id: string) {
    return this.guestbookService.getEntryById(id);
  }

  @Patch('entry/:id/claim')
  async claimSouvenir(@Param('id') id: string) {
    return this.guestbookService.claimSouvenir(id);
  }
}
