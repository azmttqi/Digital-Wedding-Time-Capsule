import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  getAllTasks() {
    return this.tasksService.getAllTasks();
  }

  @Get('event/:slug')
  getTasksByEvent(@Param('slug') slug: string) {
    return this.tasksService.getTasksByEvent(slug);
  }

  @Post('event/:slug')
  createTask(@Param('slug') slug: string, @Body('text') text: string) {
    return this.tasksService.createTask(slug, text);
  }

  @Post('global')
  createGlobalTask(@Body('text') text: string) {
    return this.tasksService.createGlobalTask(text);
  }

  @Patch(':id')
  updateTaskStatus(@Param('id') id: string, @Body('completed') completed: boolean) {
    return this.tasksService.updateTaskStatus(id, completed);
  }

  @Delete(':id')
  deleteTask(@Param('id') id: string) {
    return this.tasksService.deleteTask(id);
  }
}
