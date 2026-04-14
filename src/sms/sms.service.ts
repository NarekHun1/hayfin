import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import Twilio from 'twilio';

@Injectable()
export class SmsService {
  private client = Twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );

  async sendSms(to: string, body: string) {
    try {
      if (!to?.trim()) {
        throw new BadRequestException('Phone number is required');
      }

      const normalizedPhone = this.normalizePhone(to);

      console.log('RAW PHONE =', to);
      console.log('NORMALIZED PHONE =', normalizedPhone);

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
    } catch (error: any) {
      if (error?.code === 21608) {
        throw new BadRequestException(
          'Twilio trial account can send SMS only to verified phone numbers. Please verify this number in Twilio or upgrade the account.',
        );
      }

      throw new InternalServerErrorException(
        error?.message || 'SMS sending failed',
      );
    }
  }
  private normalizePhone(phone: string) {
    const cleaned = phone.replace(/[^\d+]/g, '');

    if (cleaned.startsWith('+')) {
      return cleaned;
    }

    if (cleaned.startsWith('374')) {
      return `+${cleaned}`;
    }

    if (cleaned.startsWith('0')) {
      return `+374${cleaned.slice(1)}`;
    }

    return `+${cleaned}`;
  }
}
