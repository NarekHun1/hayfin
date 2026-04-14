import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from '../loan-application/scoring.service';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [SmsModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService, PrismaService, ScoringService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}