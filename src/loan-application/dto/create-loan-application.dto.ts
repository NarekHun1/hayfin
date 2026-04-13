import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EmploymentStatus } from '@prisma/client';

export class CreateLoanApplicationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Transform(({ value }) => String(value).trim())
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Transform(({ value }) => String(value).trim())
  phone: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  amount: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  termMonths: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  monthlyIncome?: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Transform(({ value }) => (value == null ? undefined : String(value).trim()))
  workplace?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => (value == null ? undefined : String(value).trim()))
  loanPurpose?: string;

  @IsOptional()
  @IsBoolean()
  hasActiveLoans?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => (value == null ? undefined : String(value).trim()))
  comment?: string;

  @IsEnum(EmploymentStatus)
  employmentStatus: EmploymentStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  jobYears?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  activeLoanMonthlyPay?: number;

  @IsOptional()
  @IsBoolean()
  hasOverdueNow?: boolean;

  @IsOptional()
  @IsBoolean()
  wasBlacklistedBefore?: boolean;

  @IsOptional()
  @IsBoolean()
  isBlacklistedNow?: boolean;

  @IsOptional()
  @IsBoolean()
  hadDelaysBefore?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  monthsSinceLastDelay?: number;
}