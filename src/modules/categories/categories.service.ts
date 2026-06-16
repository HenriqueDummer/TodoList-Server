import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCategoryDto: CreateCategoryDto, userId: string) {
    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        user: {
          connect: { id: userId },
        },
      },
    });
  }
}
