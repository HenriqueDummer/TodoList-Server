import { BadRequestException, Injectable } from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(firebaseUser: DecodedIdToken, createUserDto: CreateUserDto) {
    if (!firebaseUser.email) {
      throw new BadRequestException('Firebase token must include an email');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { firebaseId: firebaseUser.uid },
    });

    if (existingUser) {
      return existingUser;
    }

    return this.prisma.user.create({
      data: {
        firebaseId: firebaseUser.uid,
        email: firebaseUser.email,
        name: createUserDto.name ?? firebaseUser.name ?? null,
      },
    });
  }

  findByFirebaseId(firebaseId: string) {
    return this.prisma.user.findUnique({
      where: { firebaseId },
    });
  }
}
