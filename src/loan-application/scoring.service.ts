import { Injectable } from '@nestjs/common';
import { EmploymentStatus, ProbabilityLevel } from '@prisma/client';
import { CreateLoanApplicationDto } from './dto/create-loan-application.dto';

type ScoringResult = {
  scoringPoints: number;
  approvalProbability: number;
  probabilityLevel: ProbabilityLevel;
  autoDecision: string;
  riskNotes: string;
};

@Injectable()
export class ScoringService {
  calculate(dto: CreateLoanApplicationDto): ScoringResult {
    let score = 50;
    const notes: string[] = [];

    const income = dto.monthlyIncome ?? 0;
    const term = dto.termMonths ?? 12;
    const currentLoanPay = dto.activeLoanMonthlyPay ?? 0;
    const estimatedNewLoanMonthlyPay =
      dto.amount > 0 ? Math.ceil(dto.amount / term) : 0;
    const totalMonthlyDebt = currentLoanPay + estimatedNewLoanMonthlyPay;

    if (income > 0) {
      const debtRatio = totalMonthlyDebt / income;

      if (debtRatio <= 0.3) {
        score += 15;
        notes.push('Low debt burden');
      } else if (debtRatio <= 0.5) {
        score += 5;
        notes.push('Acceptable debt burden');
      } else if (debtRatio <= 0.7) {
        score -= 10;
        notes.push('High debt burden');
      } else {
        score -= 25;
        notes.push('Very high debt burden');
      }
    } else {
      score -= 20;
      notes.push('Income not confirmed');
    }

    if (
      dto.employmentStatus === EmploymentStatus.EMPLOYED ||
      dto.employmentStatus === EmploymentStatus.SELF_EMPLOYED
    ) {
      score += 10;
      notes.push('Has employment');
    }

    if (dto.employmentStatus === EmploymentStatus.UNEMPLOYED) {
      score -= 20;
      notes.push('Unemployed');
    }

    if ((dto.jobYears ?? 0) >= 2) {
      score += 10;
      notes.push('Stable work history');
    } else if ((dto.jobYears ?? 0) > 0 && (dto.jobYears ?? 0) < 1) {
      score -= 5;
      notes.push('Short work history');
    }

    if (dto.hasActiveLoans === false) {
      score += 8;
      notes.push('No active loans');
    } else if (dto.hasActiveLoans === true) {
      score -= 5;
      notes.push('Has active loans');
    }

    if (dto.hasOverdueNow === true) {
      score -= 40;
      notes.push('Current overdue exists');
    }

    if (dto.isBlacklistedNow === true) {
      score -= 70;
      notes.push('Currently blacklisted');
    } else if (dto.wasBlacklistedBefore === true) {
      score -= 10;
      notes.push('Previously blacklisted');
    }

    if (dto.hadDelaysBefore === true) {
      const months = dto.monthsSinceLastDelay ?? 0;

      if (months >= 12) {
        score += 5;
        notes.push('Old delays, now stabilized');
      } else if (months >= 6) {
        score -= 5;
        notes.push('Recent delays in history');
      } else {
        score -= 15;
        notes.push('Very recent delays');
      }
    }

    score = Math.max(0, Math.min(100, score));

    let probabilityLevel: ProbabilityLevel;
    let autoDecision: string;

    if (score <= 20) {
      probabilityLevel = ProbabilityLevel.VERY_LOW;
      autoDecision = 'likely_rejected';
    } else if (score <= 40) {
      probabilityLevel = ProbabilityLevel.LOW;
      autoDecision = 'manual_review';
    } else if (score <= 60) {
      probabilityLevel = ProbabilityLevel.MEDIUM;
      autoDecision = 'manual_review';
    } else if (score <= 80) {
      probabilityLevel = ProbabilityLevel.HIGH;
      autoDecision = 'likely_approved';
    } else {
      probabilityLevel = ProbabilityLevel.VERY_HIGH;
      autoDecision = 'likely_approved';
    }

    return {
      scoringPoints: score,
      approvalProbability: score,
      probabilityLevel,
      autoDecision,
      riskNotes: notes.join(', '),
    };
  }
}
