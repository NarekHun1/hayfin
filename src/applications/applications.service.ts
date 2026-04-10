import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateApplicationDto, userId?: number) {
    return this.prisma.loanApplication.create({
      data: {
        userId,
        fullName: dto.fullName,
        phone: dto.phone.trim(),
        amount: dto.amount,
        termMonths: dto.termMonths,
        monthlyIncome: dto.monthlyIncome,
        workplace: dto.workplace,
        loanPurpose: dto.loanPurpose,
        hasActiveLoans: dto.hasActiveLoans,
        comment: dto.comment,
      },
    });
  }
}