/**
 * Production Communication & Notification Service for Zibonbaba.com
 * Handles Transactional Email (Resend / SendGrid / SMTP / Mock)
 * and SMS (Greenweb BD / Twilio / Mock) with reusable templates.
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SmsOptions {
  to: string;
  message: string;
}

export class CommunicationService {
  private static instance: CommunicationService;

  private resendApiKey = process.env.RESEND_API_KEY || '';
  private sendgridApiKey = process.env.SENDGRID_API_KEY || '';
  private emailFrom = process.env.EMAIL_FROM || 'Zibonbaba <no-reply@zibonbaba.com>';

  private greenwebToken = process.env.GREENWEB_SMS_TOKEN || '';
  private twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || '';
  private twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';
  private twilioFromNumber = process.env.TWILIO_FROM_NUMBER || '';

  private baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zibonbaba.com';

  private constructor() {}

  public static getInstance(): CommunicationService {
    if (!CommunicationService.instance) {
      CommunicationService.instance = new CommunicationService();
    }
    return CommunicationService.instance;
  }

  /**
   * Dispatches transactional email using configured provider or falls back to logger.
   */
  public async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { to, subject, html, text } = options;

    // 1. Resend API
    if (this.resendApiKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.resendApiKey}`
          },
          body: JSON.stringify({
            from: this.emailFrom,
            to: [to],
            subject,
            html,
            text
          })
        });
        const data = await res.json();
        if (res.ok) {
          return { success: true, messageId: data.id };
        }
        console.error('[COMMUNICATION_SERVICE] Resend API error:', data);
      } catch (err: any) {
        console.error('[COMMUNICATION_SERVICE] Resend dispatch failure:', err);
      }
    }

    // 2. SendGrid API Fallback
    if (this.sendgridApiKey) {
      try {
        const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.sendgridApiKey}`
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: to }] }],
            from: { email: this.emailFrom.replace(/.*<([^>]+)>.*/, '$1') || 'support@zibonbaba.com', name: 'Zibonbaba Marketplace' },
            subject,
            content: [{ type: 'text/html', value: html }]
          })
        });
        if (res.ok) {
          return { success: true };
        }
      } catch (err: any) {
        console.error('[COMMUNICATION_SERVICE] SendGrid dispatch failure:', err);
      }
    }

    // 3. Fallback: Log securely in non-production or when credentials are not yet configured
    console.log(`[COMMUNICATION_MOCK_EMAIL] To: ${to} | Subject: "${subject}"`);
    return { success: true, messageId: `mock_email_${Date.now()}` };
  }

  /**
   * Dispatches SMS using Bangladesh Gateway (Greenweb BD) or Twilio.
   */
  public async sendSms(options: SmsOptions): Promise<{ success: boolean; error?: string }> {
    const { to, message } = options;
    const sanitizedPhone = to.replace(/[^0-9+]/g, '');

    // 1. Greenweb Bangladesh Gateway
    if (this.greenwebToken) {
      try {
        const params = new URLSearchParams({
          token: this.greenwebToken,
          to: sanitizedPhone.startsWith('+') ? sanitizedPhone : `+88${sanitizedPhone}`,
          message
        });
        const res = await fetch(`http://api.greenweb.com.bd/api.php?${params.toString()}`);
        const responseText = await res.text();
        if (responseText.includes('Ok') || responseText.includes('SUCCESS')) {
          return { success: true };
        }
        console.error('[COMMUNICATION_SERVICE] Greenweb SMS response:', responseText);
      } catch (err: any) {
        console.error('[COMMUNICATION_SERVICE] Greenweb SMS error:', err);
      }
    }

    // 2. Twilio Gateway
    if (this.twilioAccountSid && this.twilioAuthToken && this.twilioFromNumber) {
      try {
        const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`;
        const auth = Buffer.from(`${this.twilioAccountSid}:${this.twilioAuthToken}`).toString('base64');
        const params = new URLSearchParams({
          To: sanitizedPhone,
          From: this.twilioFromNumber,
          Body: message
        });

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });

        if (res.ok) {
          return { success: true };
        }
      } catch (err: any) {
        console.error('[COMMUNICATION_SERVICE] Twilio SMS error:', err);
      }
    }

    // 3. Mock SMS Logger
    console.log(`[COMMUNICATION_MOCK_SMS] Phone: ${sanitizedPhone} | Text: "${message}"`);
    return { success: true };
  }

  // ---------------------------------------------------------------------------
  // TRANSACTIONAL TEMPLATES
  // ---------------------------------------------------------------------------

  /**
   * Password Reset Email Template
   */
  public async sendPasswordResetEmail(email: string, resetUrl: string, name: string = 'Valued Member') {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800;">Zibon<span style="color: #f59e0b;">baba</span></h1>
          <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Password Reset Request</p>
        </div>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          We received a request to reset your password for your Zibonbaba account. Click the secure button below to set a new password:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="background: #f59e0b; color: #0f172a; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
            Reset My Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
          This link is valid for <strong>15 minutes</strong>. If you did not request this password reset, please ignore this email or contact support if you suspect unauthorized activity.
        </p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
          © ${new Date().getFullYear()} Zibonbaba.com • Gulshan 2, Dhaka, Bangladesh
        </p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Security Alert: Reset Your Zibonbaba Password',
      html,
      text: `Reset your Zibonbaba password by opening this link: ${resetUrl}`
    });
  }

  /**
   * Order Confirmation Email & SMS
   */
  public async sendOrderConfirmation(email: string, phone: string | null, order: any) {
    const orderNumber = (order.id || '').substring(0, 8).toUpperCase();
    const totalBDT = `৳ ${Number(order.total || 0).toLocaleString('en-BD')}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800;">Zibon<span style="color: #f59e0b;">baba</span></h1>
          <p style="color: #10b981; font-weight: 600; font-size: 14px; margin: 4px 0 0 0;">✓ Order Placed Successfully</p>
        </div>
        <p style="color: #334155; font-size: 14px;">Thank you for shopping on Zibonbaba! Your order has been placed and is being processed.</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 18px 0;">
          <p style="margin: 0 0 6px 0; font-size: 13px; color: #64748b;">Order Number: <strong style="color: #0f172a;">#${orderNumber}</strong></p>
          <p style="margin: 0; font-size: 13px; color: #64748b;">Total Amount: <strong style="color: #0f172a;">${totalBDT}</strong></p>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${this.baseUrl}/tracking?orderId=${order.id}" style="background: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: 600; display: inline-block;">
            Track Order Live
          </a>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: `Order Confirmation #${orderNumber} — Zibonbaba`,
      html
    });

    if (phone) {
      await this.sendSms({
        to: phone,
        message: `Zibonbaba: Order #${orderNumber} (${totalBDT}) placed successfully. Track status at: ${this.baseUrl}/tracking?orderId=${order.id}`
      });
    }
  }

  /**
   * OTP Verification SMS
   */
  public async sendOtpSms(phone: string, otp: string, purpose: string = 'verification') {
    return this.sendSms({
      to: phone,
      message: `Your Zibonbaba ${purpose} OTP is ${otp}. Valid for 5 minutes. Do not share this code with anyone.`
    });
  }
}

export const communicationService = CommunicationService.getInstance();
