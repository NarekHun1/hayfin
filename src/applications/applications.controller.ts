import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SendApplicationSmsDto } from './dto/send-application-sms.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @Post(':id/send-sms')
  async sendSms(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SendApplicationSmsDto,
    @Req() req: any,
  ) {
    return this.applicationsService.sendSmsToApplication(
      id,
      dto.text,
      req.user?.id,
    );
  }
  // обычный пользователь
  @Post()
  async create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(dto);
  }

  // авторизованный пользователь
  @UseGuards(JwtAuthGuard)
  @Post('auth')
  async createWithAuth(@Body() dto: CreateApplicationDto, @Req() req: any) {
    return this.applicationsService.create(dto, req.user.userId);
  }

  // 🔥 ТОЛЬКО АДМИН / МЕНЕДЖЕР
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @Get()
  async findAll() {
    return this.applicationsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.applicationsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @Patch(':id/status')
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.applicationsService.updateStatus(id, dto);
  }
}
