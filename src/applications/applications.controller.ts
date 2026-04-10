import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  async create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('auth')
  async createWithAuth(@Body() dto: CreateApplicationDto, @Req() req: any) {
    return this.applicationsService.create(dto, req.user.userId);
  }
}