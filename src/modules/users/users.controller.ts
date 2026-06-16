import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { CurrentFirebaseUser } from '../auth/decorators/current-firebase-user.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { LocalUserGuard } from '../auth/guards/local-user.guard';
import type { User } from '../../../generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  create(
    @CurrentFirebaseUser() firebaseUser: DecodedIdToken,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(firebaseUser, createUserDto);
  }

  @Get('me')
  @UseGuards(LocalUserGuard)
  me(@CurrentUser() user: User) {
    return user;
  }
}
