import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus, UserRole } from '@prisma/client';
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
      needsDocumentsApplications,
      approvedApplications,
      rejectedApplications,
      completedApplications,
      totalUsers,
      activeUsers,
      latestApplications,
      users,
    ] = await Promise.all([
      this.prisma.loanApplication.count(),
      this.prisma.loanApplication.count({
        where: { status: ApplicationStatus.NEW },
      }),
      this.prisma.loanApplication.count({
        where: { status: ApplicationStatus.IN_REVIEW },
      }),
      this.prisma.loanApplication.count({
        where: { status: ApplicationStatus.NEEDS_DOCUMENTS },
      }),
      this.prisma.loanApplication.count({
        where: { status: ApplicationStatus.APPROVED },
      }),
      this.prisma.loanApplication.count({
        where: { status: ApplicationStatus.REJECTED },
      }),
      this.prisma.loanApplication.count({
        where: { status: ApplicationStatus.COMPLETED },
      }),
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { isActive: true },
      }),
      this.prisma.loanApplication.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          fullName: true,
          phone: true,
          amount: true,
          termMonths: true,
          monthlyIncome: true,
          workplace: true,
          loanPurpose: true,
          hasActiveLoans: true,
          comment: true,
          managerComment: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              role: true,
              isActive: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              role: true,
              isActive: true,
            },
          },
        },
      }),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      totalApplications,
      newApplications,
      inReviewApplications,
      needsDocumentsApplications,
      approvedApplications,
      rejectedApplications,
      completedApplications,
      totalUsers,
      activeUsers,
      latestApplications,
      users,
    };
  }

  async getApplications(status?: ApplicationStatus) {
    return this.prisma.loanApplication.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        fullName: true,
        phone: true,
        amount: true,
        termMonths: true,
        monthlyIncome: true,
        workplace: true,
        loanPurpose: true,
        hasActiveLoans: true,
        comment: true,
        managerComment: true,
        status: true,
        assignedToId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isActive: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  async getApplicationById(id: number) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        fullName: true,
        phone: true,
        amount: true,
        termMonths: true,
        monthlyIncome: true,
        workplace: true,
        loanPurpose: true,
        hasActiveLoans: true,
        comment: true,
        managerComment: true,
        status: true,
        assignedToId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async updateApplicationStatus(id: number, dto: UpdateApplicationStatusDto) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.loanApplication.update({
      where: { id },
      data: {
        status: dto.status,
        managerComment: dto.managerComment ?? application.managerComment,
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        amount: true,
        status: true,
        managerComment: true,
        assignedToId: true,
        createdAt: true,
        updatedAt: true,
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
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!manager) {
      throw new NotFoundException('Manager not found');
    }

    if (!manager.isActive) {
      throw new BadRequestException('Selected manager is inactive');
    }

    if (
      manager.role !== UserRole.ADMIN &&
      manager.role !== UserRole.MANAGER &&
      manager.role !== UserRole.CONTENT_MANAGER
    ) {
      throw new BadRequestException(
        'Selected user cannot be assigned to applications',
      );
    }

    return this.prisma.loanApplication.update({
      where: { id },
      data: { assignedToId },
      select: {
        id: true,
        fullName: true,
        phone: true,
        amount: true,
        status: true,
        assignedToId: true,
        updatedAt: true,
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  async unassignApplication(id: number) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.loanApplication.update({
      where: { id },
      data: { assignedToId: null },
      select: {
        id: true,
        fullName: true,
        phone: true,
        amount: true,
        status: true,
        assignedToId: true,
        updatedAt: true,
      },
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
        updatedAt: true,
        _count: {
          select: {
            applications: true,
            assignedApps: true,
          },
        },
      },
    });
  }

  async getManagers() {
    return this.prisma.user.findMany({
      where: {
        isActive: true,
        role: {
          in: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CONTENT_MANAGER],
        },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            assignedApps: true,
          },
        },
      },
    });
  }

  async updateUserRole(userId: number, role: UserRole) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUserActiveStatus(userId: number, isActive: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
