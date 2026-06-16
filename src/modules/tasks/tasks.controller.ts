import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LocalUserGuard } from '../auth/guards/local-user.guard';
import type { User } from '../../../generated/prisma/client';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(LocalUserGuard)
  create(@CurrentUser() user: User, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto, user.id);
  }
}
