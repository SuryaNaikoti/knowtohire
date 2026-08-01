export interface EmailTemplateRenderResult {
  subject: string;
  body: string;
  htmlBody: string;
}

export interface EmailTemplateContract {
  render(data: Record<string, unknown>): EmailTemplateRenderResult;
}

export class BaseEmailLayout {
  static wrap(contentHtml: string, title: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
            .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0; shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .header { border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 24px; }
            .brand { font-size: 20px; font-weight: 700; color: #059669; text-decoration: none; }
            .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <a href="#" class="brand">Know to Hire</a>
            </div>
            <h2>${title}</h2>
            <div>${contentHtml}</div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Know to Hire Inc. All rights reserved.</p>
              <p>You received this transactional email based on your user notification preferences.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export class ApplicationUpdateTemplate implements EmailTemplateContract {
  render(data: Record<string, unknown>): EmailTemplateRenderResult {
    const title = (data.title as string) || 'Application Status Update';
    const body = (data.body as string) || 'Your application status has changed.';
    
    const contentHtml = `<p style="font-size: 15px; line-height: 1.6; color: #334155;">${body}</p>`;

    return {
      subject: `[Know to Hire] ${title}`,
      body,
      htmlBody: BaseEmailLayout.wrap(contentHtml, title),
    };
  }
}

export class GenericNotificationTemplate implements EmailTemplateContract {
  render(data: Record<string, unknown>): EmailTemplateRenderResult {
    const title = (data.title as string) || 'Platform Notification';
    const body = (data.body as string) || 'You have a new notification on Know to Hire.';

    const contentHtml = `<p style="font-size: 15px; line-height: 1.6; color: #334155;">${body}</p>`;

    return {
      subject: `[Know to Hire] ${title}`,
      body,
      htmlBody: BaseEmailLayout.wrap(contentHtml, title),
    };
  }
}
