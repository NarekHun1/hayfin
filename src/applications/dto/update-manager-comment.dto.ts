import { IsOptional, IsString } from 'class-validator';

export class UpdateManagerCommentDto {
  @IsOptional()
  @IsString()
  managerComment?: string;
}