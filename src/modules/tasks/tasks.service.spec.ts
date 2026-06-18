import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TasksService } from './tasks.service';

jest.mock('../../common/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

describe('TasksService', () => {
  let service: TasksService;
  let prisma: {
    task: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    category: {
      findFirst: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      task: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      category: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a task using the authenticated user id', async () => {
    const task = { id: 'task-id' };
    prisma.task.create.mockResolvedValue(task);

    await expect(
      service.create(
        {
          title: 'Task',
          description: 'Description',
          completed: true,
          priority: 'high',
          dueDate: '2026-06-18T00:00:00.000Z',
        },
        'user-id',
      ),
    ).resolves.toBe(task);

    expect(prisma.task.create).toHaveBeenCalledWith({
      data: {
        title: 'Task',
        description: 'Description',
        completed: true,
        priority: 'high',
        dueDate: new Date('2026-06-18T00:00:00.000Z'),
        user: {
          connect: { id: 'user-id' },
        },
      },
      include: {
        category: true,
      },
    });
  });

  it('creates a task with an owned category', async () => {
    const task = { id: 'task-id' };
    prisma.category.findFirst.mockResolvedValue({ id: 'category-id' });
    prisma.task.create.mockResolvedValue(task);

    await expect(
      service.create(
        {
          title: 'Task',
          priority: 'medium',
          dueDate: '2026-06-18T00:00:00.000Z',
          categoryId: 'category-id',
        },
        'user-id',
      ),
    ).resolves.toBe(task);

    expect(prisma.category.findFirst).toHaveBeenCalledWith({
      where: { id: 'category-id', userId: 'user-id' },
      select: { id: true },
    });
    expect(prisma.task.create).toHaveBeenCalledWith({
      data: {
        title: 'Task',
        priority: 'medium',
        dueDate: new Date('2026-06-18T00:00:00.000Z'),
        user: {
          connect: { id: 'user-id' },
        },
        category: {
          connect: { id: 'category-id' },
        },
      },
      include: {
        category: true,
      },
    });
  });

  it('rejects task creation with a category from another user', async () => {
    prisma.category.findFirst.mockResolvedValue(null);

    await expect(
      service.create(
        {
          title: 'Task',
          priority: 'medium',
          dueDate: '2026-06-18T00:00:00.000Z',
          categoryId: 'category-id',
        },
        'user-id',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.task.create).not.toHaveBeenCalled();
  });

  it('finds tasks scoped to the user with status and category filters', async () => {
    const tasks = [{ id: 'task-id' }];
    prisma.task.findMany.mockResolvedValue(tasks);

    await expect(
      service.findAll('user-id', {
        status: 'completed',
        categoryId: 'category-id',
      }),
    ).resolves.toBe(tasks);

    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-id',
        completed: true,
        categoryId: 'category-id',
      },
      include: {
        category: true,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  });

  it('updates an owned task and clears its category', async () => {
    const task = { id: 'task-id' };
    prisma.task.findFirst.mockResolvedValue({ id: 'task-id' });
    prisma.task.update.mockResolvedValue(task);

    await expect(
      service.update(
        'task-id',
        {
          completed: true,
          priority: 'low',
          dueDate: '2026-06-19T00:00:00.000Z',
          categoryId: null,
        },
        'user-id',
      ),
    ).resolves.toBe(task);

    expect(prisma.task.findFirst).toHaveBeenCalledWith({
      where: { id: 'task-id', userId: 'user-id' },
      select: { id: true },
    });
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-id' },
      data: {
        completed: true,
        priority: 'low',
        dueDate: new Date('2026-06-19T00:00:00.000Z'),
        category: {
          disconnect: true,
        },
      },
      include: {
        category: true,
      },
    });
  });

  it('rejects updating a task that is not owned by the user', async () => {
    prisma.task.findFirst.mockResolvedValue(null);

    await expect(
      service.update('task-id', { title: 'New title' }, 'user-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.task.update).not.toHaveBeenCalled();
  });

  it('deletes an owned task', async () => {
    const task = { id: 'task-id' };
    prisma.task.findFirst.mockResolvedValue({ id: 'task-id' });
    prisma.task.delete.mockResolvedValue(task);

    await expect(service.remove('task-id', 'user-id')).resolves.toBe(task);

    expect(prisma.task.delete).toHaveBeenCalledWith({
      where: { id: 'task-id' },
      include: {
        category: true,
      },
    });
  });

  it('rejects deleting a task that is not owned by the user', async () => {
    prisma.task.findFirst.mockResolvedValue(null);

    await expect(service.remove('task-id', 'user-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.task.delete).not.toHaveBeenCalled();
  });
});
