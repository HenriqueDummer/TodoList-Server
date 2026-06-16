import { Test, TestingModule } from '@nestjs/testing';
import { LocalUserGuard } from '../auth/guards/local-user.guard';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

jest.mock('../../common/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(LocalUserGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
