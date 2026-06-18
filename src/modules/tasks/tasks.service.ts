import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { FindTasksQueryDto } from './dto/find-tasks-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const { categoryId, ...taskData } = createTaskDto;
    await this.ensureCategoryBelongsToUser(categoryId, userId);

    return this.prisma.task.create({
      data: {
        ...taskData,
        dueDate: new Date(taskData.dueDate),
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
      include: {
        category: true,
      },
    });
  }

  findAll(userId: string, query: FindTasksQueryDto) {
    return this.prisma.task.findMany({
      where: {
        userId,
        ...(query.status
          ? {
              completed: query.status === 'completed',
            }
          : {}),
        ...(query.categoryId
          ? {
              categoryId: query.categoryId,
            }
          : {}),
      },
      include: {
        category: true,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    await this.ensureTaskBelongsToUser(id, userId);
    await this.ensureCategoryBelongsToUser(updateTaskDto.categoryId, userId);

    const { categoryId, dueDate, ...taskData } = updateTaskDto;

    return this.prisma.task.update({
      where: { id },
      data: {
        ...taskData,
        ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
        ...(categoryId !== undefined
          ? {
              category:
                categoryId === null
                  ? { disconnect: true }
                  : { connect: { id: categoryId } },
            }
          : {}),
      },
      include: {
        category: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.ensureTaskBelongsToUser(id, userId);

    return this.prisma.task.delete({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  private async ensureTaskBelongsToUser(id: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException('Task was not found.');
    }
  }

  private async ensureCategoryBelongsToUser(
    categoryId: string | null | undefined,
    userId: string,
  ) {
    if (!categoryId) {
      return;
    }

    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, userId },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException('Category was not found.');
    }
  }
}
