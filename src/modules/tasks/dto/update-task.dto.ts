import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { TASK_PRIORITIES, type TaskPriorityDto } from './create-task.dto';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsIn(TASK_PRIORITIES)
  @IsOptional()
  priority?: TaskPriorityDto;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  categoryId?: string | null;
}
