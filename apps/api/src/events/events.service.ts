import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async getAllEvents() {
    return this.prisma.event.findMany({
      select: {
        slug: true,
        coupleName: true,
        date: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getEventTheme(slug: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug }
    });
    if (!event) throw new NotFoundException('Event not found');
    return { theme: event.theme, name: event.coupleName };
  }

  async createEvent(data: { slug: string; coupleName: string; date: Date }) {
    const existing = await this.prisma.event.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return existing; // Already exists
    }
    const event = await this.prisma.event.create({
      data: {
        slug: data.slug,
        coupleName: data.coupleName,
        date: data.date,
        moderatorPin: '1234',
        couplePassword: 'password',
        missionsJson: [],
        theme: 'rose',
      }
    });
    return event;
  }

  async verifyPin(slug: string, role: string, pin: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug }
    });
    
    if (!event) throw new NotFoundException('Event not found');

    let isValid = false;
    if (role === 'hub' || role === 'admin') {
      isValid = (event.couplePassword === pin);
    } else if (role === 'mod' || role === 'souvenir') {
      isValid = (event.moderatorPin === pin || event.couplePassword === pin);
    }

    if (!isValid) {
      throw new UnauthorizedException('PIN atau Password salah');
    }

    return { success: true, role };
  }

  async updateSettings(slug: string, data: { couplePassword?: string; moderatorPin?: string; theme?: string }) {
    const event = await this.prisma.event.update({
      where: { slug },
      data
    });
    return { success: true, theme: event.theme };
  }
}
