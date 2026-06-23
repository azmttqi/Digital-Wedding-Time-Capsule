import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PhotosService {
  constructor(private prisma: PrismaService) {}

  async createPhotoRecord(data: { eventSlug: string; url: string; uploaderName?: string; missionId?: string; caption?: string }) {
    // 1. Ensure the event exists
    let event = await this.prisma.event.findUnique({
      where: { slug: data.eventSlug },
    });

    // If event doesn't exist, throw error
    if (!event) {
      throw new Error('Event not found');
    }

    // 2. Create the photo record
    const photo = await this.prisma.photo.create({
      data: {
        eventId: event.id,
        storageKey: data.url, // Using url as storageKey for now
        uploaderSessionId: data.uploaderName || 'Guest',
        caption: data.caption || null,
        missionId: data.missionId || null,
        status: 'PENDING', // Default status for moderation
      },
    });

    return photo;
  }

  async getEventPhotos(eventSlug: string, status?: string) {
    const whereClause: any = { event: { slug: eventSlug } };
    if (status) {
      whereClause.status = status;
    }
    const orderDirection = status === 'PENDING' ? 'asc' : 'desc';
    return this.prisma.photo.findMany({
      where: whereClause,
      orderBy: { createdAt: orderDirection },
    });
  }

  async getCapturesCount(range: string = 'today') {
    if (range === 'all') {
      return this.prisma.photo.count();
    }
    
    let targetDate = new Date();
    if (range !== 'today') {
      const parsed = new Date(range);
      if (!isNaN(parsed.getTime())) {
        targetDate = parsed;
      }
    }
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.photo.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        }
      }
    });
  }

  async updatePhotoStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    return this.prisma.photo.update({
      where: { id },
      data: { status },
    });
  }
}
