import { Injectable, BadRequestException } from '@nestjs/common';
import Twilio from 'twilio';

@Injectable()
export class SmsService {
  private client = Twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );

  async sendSms(to: string, body: string) {
    if (!to) {
      throw new BadRequestException('Phone number is required');
    }

    const normalizedPhone = this.normalizePhone(to);

    const message = await this.client.messages.create({
      to: normalizedPhone,
      body,
      from: process.env.TWILIO_FROM!,
    });

    return {
      sid: message.sid,
      status: message.status,
      to: message.to,
      body: message.body,
    };
  }

  private normalizePhone(phone: string) {
    const cleaned = phone.replace(/[^\d+]/g, '');

    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.startsWith('374')) return `+${cleaned}`;
    if (cleaned.startsWith('0')) return `+374${cleaned.slice(1)}`;

    return `+${cleaned}`;
  }
}
