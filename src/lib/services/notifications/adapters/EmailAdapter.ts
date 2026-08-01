import type { NotificationDeliveryResult } from '../types';

export interface EmailProviderAdapter {
  sendEmail(
    to: string,
    subject: string,
    body: string,
    htmlBody?: string
  ): Promise<NotificationDeliveryResult>;
}

export class ResendEmailAdapter implements EmailProviderAdapter {
  async sendEmail(
    to: string,
    subject: string,
    _body: string,
    _htmlBody?: string
  ): Promise<NotificationDeliveryResult> {
    try {
      console.log(`[EmailAdapter:Resend] Simulated dispatch to: ${to} | Subject: ${subject}`);
      return {
        channel: 'email',
        success: true,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Email delivery failed';
      return {
        channel: 'email',
        success: false,
        error: errorMsg,
      };
    }
  }
}

export const emailAdapter = new ResendEmailAdapter();
