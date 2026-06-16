import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    TasksModule,
    CategoriesModule,
  ],
})
export class AppModule {}
