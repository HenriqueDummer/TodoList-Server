import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    HealthModule,
    AuthModule,
    UsersModule,
    TasksModule,
    CategoriesModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
