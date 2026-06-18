import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PhotosService {
  constructor(private prisma: PrismaService) {}

  async createPhotoRecord(data: { eventSlug: string; url: string; uploaderName?: string; missionId?: string }) {
    // 1. Ensure the event exists
    let event = await this.prisma.event.findUnique({
      where: { slug: data.eventSlug },
    });

    // If event doesn't exist, create it (just to simplify testing)
    if (!event) {
      event = await this.prisma.event.create({
        data: {
          slug: data.eventSlug,
          coupleName: "Pasangan " + data.eventSlug,
          date: new Date(),
          moderatorPin: "1234",
          couplePassword: "password",
          missionsJson: [],
        }
      });
    }

    // 2. Create the photo record
    const photo = await this.prisma.photo.create({
      data: {
        eventId: event.id,
        storageKey: data.url, // Using url as storageKey for now
        uploaderSessionId: data.uploaderName || 'guest-session',
        caption: null,
        missionId: data.missionId || null,
        status: 'PENDING', // Default status for moderation
      },
    });

    return photo;
  }

  async getApprovedPhotos(eventSlug: string) {
    return this.prisma.photo.findMany({
      where: {
        event: { slug: eventSlug },
        status: 'APPROVED',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingPhotos(eventSlug: string) {
    return this.prisma.photo.findMany({
      where: {
        event: { slug: eventSlug },
        status: 'PENDING',
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updatePhotoStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    return this.prisma.photo.update({
      where: { id },
      data: { status },
    });
  }
}
