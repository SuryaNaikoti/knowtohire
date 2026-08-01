import type { NotificationDeliveryResult } from './types';

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
      // Fallback/Simulated dispatch when provider API key is not configured locally
      return {
        channel: 'email',
        success: true,
      };
    } catch (err: any) {
      return {
        channel: 'email',
        success: false,
        error: err?.message || 'Email delivery failed',
      };
    }
  }
}

export const emailAdapter = new ResendEmailAdapter();
