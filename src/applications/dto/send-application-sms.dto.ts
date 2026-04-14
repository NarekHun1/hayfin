import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendApplicationSmsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  text: string;
}