import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UsersService } from './users.service';

jest.mock('../../common/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };

  const now = new Date('2026-01-01T00:00:00.000Z');

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a user from decoded Firebase identity', async () => {
    const createdUser = {
      id: 'user-id',
      firebaseId: 'firebase-user-id',
      email: 'user@example.com',
      name: 'Profile Name',
      createdAt: now,
      updatedAt: now,
    };
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(createdUser);

    await expect(
      service.create(
        {
          uid: 'firebase-user-id',
          email: 'user@example.com',
          name: 'Firebase Name',
        } as never,
        { name: 'Profile Name' },
      ),
    ).resolves.toBe(createdUser);

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        firebaseId: 'firebase-user-id',
        email: 'user@example.com',
        name: 'Profile Name',
      },
    });
  });

  it('returns an existing user when firebaseId already exists', async () => {
    const existingUser = {
      id: 'user-id',
      firebaseId: 'firebase-user-id',
      email: 'user@example.com',
      name: null,
      createdAt: now,
      updatedAt: now,
    };
    prisma.user.findUnique.mockResolvedValue(existingUser);

    await expect(
      service.create(
        {
          uid: 'firebase-user-id',
          email: 'user@example.com',
          name: 'Firebase Name',
        } as never,
        { name: 'Ignored Name' },
      ),
    ).resolves.toBe(existingUser);

    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('does not trust client-provided firebaseId or email', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-id',
      firebaseId: 'real-firebase-id',
      email: 'real@example.com',
      name: null,
      createdAt: now,
      updatedAt: now,
    });

    await service.create(
      {
        uid: 'real-firebase-id',
        email: 'real@example.com',
      } as never,
      {
        firebaseId: 'fake-firebase-id',
        email: 'fake@example.com',
      } as never,
    );

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        firebaseId: 'real-firebase-id',
        email: 'real@example.com',
        name: null,
      },
    });
  });
});
