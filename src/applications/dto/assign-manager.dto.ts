import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AssignManagerDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  assignedToId?: number;
}