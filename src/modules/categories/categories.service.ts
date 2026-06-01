import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCategoryDto: CreateCategoryDto) {
    const { userId, ...categoryData } = createCategoryDto;

    return this.prisma.category.create({
      data: {
        ...categoryData,
        user: {
          connect: { id: userId },
        },
      },
    });
  }
}
