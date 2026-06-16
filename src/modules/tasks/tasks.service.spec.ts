import { Test, TestingModule } from '@nestjs/testing';
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
    };
  };

  beforeEach(async () => {
    prisma = {
      task: {
        create: jest.fn(),
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
        },
        'user-id',
      ),
    ).resolves.toBe(task);

    expect(prisma.task.create).toHaveBeenCalledWith({
      data: {
        title: 'Task',
        description: 'Description',
        completed: true,
        user: {
          connect: { id: 'user-id' },
        },
      },
    });
  });
});
