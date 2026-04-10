import { Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalApplications,
      newApplications,
      inReviewApplications,
      approvedApplications,
      rejectedApplications,
      totalUsers,
      latestApplications,
    ] = await Promise.all([
      this.prisma.loanApplication.count(),
      this.prisma.loanApplication.count({
        where: { status: ApplicationStatus.NEW },
      }),
      this.prisma.loanApplication.count({
        where: { status: ApplicationStatus.IN_REVIEW },
      }),
      this.prisma.loanApplication.count({
        where: { status: ApplicationStatus.APPROVED },
      }),
      this.prisma.loanApplication.count({
        where: { status: ApplicationStatus.REJECTED },
      }),
      this.prisma.user.count(),
      this.prisma.loanApplication.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
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
      }),
    ]);

    return {
      totalApplications,
      newApplications,
      inReviewApplications,
      approvedApplications,
      rejectedApplications,
      totalUsers,
      latestApplications,
    };
  }

  async getApplications(status?: ApplicationStatus) {
    return this.prisma.loanApplication.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async getApplicationById(id: number) {
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

    return application;
  }

  async updateApplicationStatus(
    id: number,
    dto: UpdateApplicationStatusDto,
  ) {
    const existing = await this.prisma.loanApplication.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.loanApplication.update({
      where: { id },
      data: {
        status: dto.status,
        managerComment: dto.managerComment,
      },
    });
  }

  async assignApplication(id: number, assignedToId: number) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const manager = await this.prisma.user.findUnique({
      where: { id: assignedToId },
    });

    if (!manager) {
      throw new NotFoundException('Manager not found');
    }

    return this.prisma.loanApplication.update({
      where: { id },
      data: { assignedToId },
    });
  }

  async getUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }
}