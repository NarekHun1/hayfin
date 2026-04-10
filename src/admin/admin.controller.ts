import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApplicationStatus, UserRole } from '@prisma/client';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MANAGER')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('applications')
  getApplications(@Query('status') status?: ApplicationStatus) {
    return this.adminService.getApplications(status);
  }

  @Get('applications/:id')
  getApplicationById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getApplicationById(id);
  }

  @Patch('applications/:id/status')
  updateApplicationStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.adminService.updateApplicationStatus(id, dto);
  }

  @Patch('applications/:id/assign/:managerId')
  assignApplication(
    @Param('id', ParseIntPipe) id: number,
    @Param('managerId', ParseIntPipe) managerId: number,
  ) {
    return this.adminService.assignApplication(id, managerId);
  }

  @Patch('applications/:id/unassign')
  unassignApplication(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.unassignApplication(id);
  }

  @Get('users')
  @Roles('ADMIN')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Get('managers')
  @Roles('ADMIN')
  getManagers() {
    return this.adminService.getManagers();
  }

  @Patch('users/:id/role/:role')
  @Roles('ADMIN')
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Param('role') role: UserRole,
  ) {
    return this.adminService.updateUserRole(id, role);
  }

  @Patch('users/:id/active')
  @Roles('ADMIN')
  updateUserActiveStatus(
    @Param('id', ParseIntPipe) id: number,
    @Query('value', ParseBoolPipe) value: boolean,
  ) {
    return this.adminService.updateUserActiveStatus(id, value);
  }
}