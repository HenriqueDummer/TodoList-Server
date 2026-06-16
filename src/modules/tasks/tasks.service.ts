import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTaskDto: CreateTaskDto, userId: string) {
    const { categoryId, ...taskData } = createTaskDto;

    return this.prisma.task.create({
      data: {
        ...taskData,
        user: {
          connect: { id: userId },
        },
        ...(categoryId
          ? {
              category: {
                connect: { id: categoryId },
              },
            }
          : {}),
      },
    });
  }
}
