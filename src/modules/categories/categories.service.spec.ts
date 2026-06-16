import { Test, TestingModule } from '@nestjs/testing';
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
    };
  };

  beforeEach(async () => {
    prisma = {
      category: {
        create: jest.fn(),
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

    await expect(service.create({ name: 'Work' }, 'user-id')).resolves.toBe(
      category,
    );

    expect(prisma.category.create).toHaveBeenCalledWith({
      data: {
        name: 'Work',
        user: {
          connect: { id: 'user-id' },
        },
      },
    });
  });
});
