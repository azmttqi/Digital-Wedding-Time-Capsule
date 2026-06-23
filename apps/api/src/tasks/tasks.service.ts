import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async getAllTasks() {
    return this.prisma.task.findMany({
      include: {
        event: {
          select: { coupleName: true, slug: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getTasksByEvent(eventSlug: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug: eventSlug }
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.task.findMany({
      where: { eventId: event.id },
      orderBy: { createdAt: 'asc' }
    });
  }

  async createTask(eventSlug: string, text: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug: eventSlug }
    });
    
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.task.create({
      data: {
        eventId: event.id,
        text
      }
    });
  }

  async createGlobalTask(text: string) {
    return this.prisma.task.create({
      data: {
        text
      }
    });
  }

  async updateTaskStatus(id: string, completed: boolean) {
    return this.prisma.task.update({
      where: { id },
      data: { completed }
    });
  }

  async deleteTask(id: string) {
    return this.prisma.task.delete({
      where: { id }
    });
  }
}
