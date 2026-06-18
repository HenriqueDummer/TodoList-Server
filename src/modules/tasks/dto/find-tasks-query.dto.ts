import { IsIn, IsOptional, IsString } from 'class-validator';

export const TASK_STATUSES = ['completed', 'pending'] as const;
export type TaskStatusDto = (typeof TASK_STATUSES)[number];

export class FindTasksQueryDto {
  @IsIn(TASK_STATUSES)
  @IsOptional()
  status?: TaskStatusDto;

  @IsString()
  @IsOptional()
  categoryId?: string;
}
