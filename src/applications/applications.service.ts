import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ScoringService } from '../loan-application/scoring.service';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { AssignManagerDto } from './dto/assign-manager.dto';
import { UpdateManagerCommentDto } from './dto/update-manager-comment.dto';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scoringService: ScoringService,
    private readonly smsService: SmsService,
  ) {}
  async sendSmsToApplication(id: number, text: string, adminId?: number) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id },
      include: {
        user: true,
        assignedTo: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (!application.phone?.trim()) {
      throw new BadRequestException('Application phone not found');
    }

    const result = await this.smsService.sendSms(
      application.phone,
      text.trim(),
    );

    return {
      success: true,
      applicationId: application.id,
      phone: application.phone,
      sms: result,
      sentByAdminId: adminId ?? null,
    };
  }
  async create(dto: CreateApplicationDto, userId?: number) {
    const scoring = this.scoringService.calculate(dto);

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

        employmentStatus: dto.employmentStatus,
        jobYears: dto.jobYears,
        activeLoanMonthlyPay: dto.activeLoanMonthlyPay,
        hasOverdueNow: dto.hasOverdueNow,
        wasBlacklistedBefore: dto.wasBlacklistedBefore,
        isBlacklistedNow: dto.isBlacklistedNow,
        hadDelaysBefore: dto.hadDelaysBefore,
        monthsSinceLastDelay: dto.monthsSinceLastDelay,

        scoringPoints: scoring.scoringPoints,
        approvalProbability: scoring.approvalProbability,
        probabilityLevel: scoring.probabilityLevel,
        autoDecision: scoring.autoDecision,
        riskNotes: scoring.riskNotes,
      },
      include: {
        user: true,
        assignedTo: true,
      },
    });
  }

  async findAll() {
    return this.prisma.loanApplication.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async updateStatus(id: number, dto: UpdateApplicationStatusDto) {
    await this.ensureExists(id);

    return this.prisma.loanApplication.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.managerComment !== undefined
          ? { managerComment: dto.managerComment }
          : {}),
      },
      include: {
        user: true,
        assignedTo: true,
      },
    });
  }

  async assignManager(id: number, dto: AssignManagerDto) {
    await this.ensureExists(id);

    if (dto.assignedToId) {
      const manager = await this.prisma.user.findUnique({
        where: { id: dto.assignedToId },
      });

      if (!manager) {
        throw new NotFoundException('Manager not found');
      }
    }

    return this.prisma.loanApplication.update({
      where: { id },
      data: {
        assignedToId: dto.assignedToId ?? null,
      },
      include: {
        user: true,
        assignedTo: true,
      },
    });
  }

  async updateManagerComment(id: number, dto: UpdateManagerCommentDto) {
    await this.ensureExists(id);

    return this.prisma.loanApplication.update({
      where: { id },
      data: {
        managerComment: dto.managerComment ?? null,
      },
      include: {
        user: true,
        assignedTo: true,
      },
    });
  }

  async getManagers() {
    return this.prisma.user.findMany({
      where: {
        isActive: true,
        role: {
          in: ['ADMIN', 'MANAGER'],
        },
      },
      orderBy: [{ role: 'asc' }, { firstName: 'asc' }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
      },
    });
  }

  private async ensureExists(id: number) {
    const exists = await this.prisma.loanApplication.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException('Application not found');
    }
  }
}
