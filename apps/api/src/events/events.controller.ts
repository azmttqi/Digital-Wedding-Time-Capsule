import { Controller, Post, Body, Param, Patch, Get } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async getAllEvents() {
    return this.eventsService.getAllEvents();
  }

  @Get(':slug')
  async getEvent(@Param('slug') slug: string) {
    return this.eventsService.getEventTheme(slug);
  }

  @Post()
  async createEvent(@Body() body: { slug: string; coupleName: string; date?: string; theme?: string; couplePassword?: string; moderatorPin?: string; venue?: string; expectedPax?: number }) {
    return this.eventsService.createEvent({
      slug: body.slug,
      coupleName: body.coupleName,
      date: body.date ? new Date(body.date) : new Date(),
      theme: body.theme,
      couplePassword: body.couplePassword,
      moderatorPin: body.moderatorPin,
      venue: body.venue,
      expectedPax: body.expectedPax ? Number(body.expectedPax) : 0,
    });
  }

  @Post(':slug/verify')
  async verifyPin(
    @Param('slug') slug: string,
    @Body() body: { role: string; pin: string }
  ) {
    return this.eventsService.verifyPin(slug, body.role, body.pin);
  }

  @Patch(':slug/settings')
  async updateSettings(
    @Param('slug') slug: string,
    @Body() body: { couplePassword?: string; moderatorPin?: string; theme?: string; clientNotes?: string; coverImageUrl?: string }
  ) {
    return this.eventsService.updateSettings(slug, body);
  }

  @Patch(':slug/status')
  async updateStatus(
    @Param('slug') slug: string,
    @Body() body: { status: any }
  ) {
    return this.eventsService.updateStatus(slug, body.status);
  }
}
