import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LocalUserGuard } from '../auth/guards/local-user.guard';
import type { User } from '../../../generated/prisma/client';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(LocalUserGuard)
  create(
    @CurrentUser() user: User,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(createCategoryDto, user.id);
  }
}
