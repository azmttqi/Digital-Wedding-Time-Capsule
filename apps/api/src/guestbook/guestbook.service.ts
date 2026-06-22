import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GuestbookService {
  constructor(private prisma: PrismaService) {}

  async createEntry(data: { eventSlug: string; name: string; message?: string; attendanceCount: number }) {
    let event = await this.prisma.event.findUnique({
      where: { slug: data.eventSlug },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    return this.prisma.guestbookEntry.create({
      data: {
        eventId: event.id,
        name: data.name,
        message: data.message || null,
        attendanceCount: data.attendanceCount,
      },
    });
  }

  async getEntries(eventSlug: string) {
    return this.prisma.guestbookEntry.findMany({
      where: {
        event: { slug: eventSlug },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEntryById(id: string) {
    return this.prisma.guestbookEntry.findUnique({
      where: { id }
    });
  }

  async claimSouvenir(id: string) {
    return this.prisma.guestbookEntry.update({
      where: { id },
      data: { souvenirClaimed: true }
    });
  }
}
