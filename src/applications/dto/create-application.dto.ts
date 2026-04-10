import { IsBoolean, IsInt, IsOptional, IsPhoneNumber, IsString, Min } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsInt()
  @Min(1000)
  amount: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  termMonths?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  monthlyIncome?: number;

  @IsOptional()
  @IsString()
  workplace?: string;

  @IsOptional()
  @IsString()
  loanPurpose?: string;

  @IsOptional()
  @IsBoolean()
  hasActiveLoans?: boolean;

  @IsOptional()
  @IsString()
  comment?: string;
}