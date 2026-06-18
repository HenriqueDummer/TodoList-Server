import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CategoriesService } from './categories.service';

jest.mock('../../common/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: {
    category: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      category: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a category using the authenticated user id', async () => {
    const category = { id: 'category-id' };
    prisma.category.create.mockResolvedValue(category);

    await expect(
      service.create(
        { name: 'Work', icon: 'briefcase', color: '#3b82f6' },
        'user-id',
      ),
    ).resolves.toBe(category);

    expect(prisma.category.create).toHaveBeenCalledWith({
      data: {
        name: 'Work',
        icon: 'briefcase',
        color: '#3b82f6',
        user: {
          connect: { id: 'user-id' },
        },
      },
    });
  });

  it('finds categories scoped to the authenticated user', async () => {
    const categories = [{ id: 'category-id' }];
    prisma.category.findMany.mockResolvedValue(categories);

    await expect(service.findAll('user-id')).resolves.toBe(categories);

    expect(prisma.category.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-id' },
      orderBy: {
        createdAt: 'desc',
      },
    });
  });

  it('updates an owned category', async () => {
    const category = { id: 'category-id' };
    prisma.category.findFirst.mockResolvedValue({ id: 'category-id' });
    prisma.category.update.mockResolvedValue(category);

    await expect(
      service.update(
        'category-id',
        { name: 'Personal', icon: 'home', color: '#22c55e' },
        'user-id',
      ),
    ).resolves.toBe(category);

    expect(prisma.category.findFirst).toHaveBeenCalledWith({
      where: { id: 'category-id', userId: 'user-id' },
      select: { id: true },
    });
    expect(prisma.category.update).toHaveBeenCalledWith({
      where: { id: 'category-id' },
      data: { name: 'Personal', icon: 'home', color: '#22c55e' },
    });
  });

  it('rejects updating a category that is not owned by the user', async () => {
    prisma.category.findFirst.mockResolvedValue(null);

    await expect(
      service.update('category-id', { name: 'Personal' }, 'user-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.category.update).not.toHaveBeenCalled();
  });

  it('deletes an owned category', async () => {
    const category = { id: 'category-id' };
    prisma.category.findFirst.mockResolvedValue({ id: 'category-id' });
    prisma.category.delete.mockResolvedValue(category);

    await expect(service.remove('category-id', 'user-id')).resolves.toBe(
      category,
    );

    expect(prisma.category.delete).toHaveBeenCalledWith({
      where: { id: 'category-id' },
    });
  });

  it('rejects deleting a category that is not owned by the user', async () => {
    prisma.category.findFirst.mockResolvedValue(null);

    await expect(
      service.remove('category-id', 'user-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.category.delete).not.toHaveBeenCalled();
  });
});
