import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private readonly mailFrom: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT') || 587;
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    this.mailFrom =
      this.configService.get<string>('MAIL_FROM') ||
      '"WordStreak Team" <no-reply@wordstreak.app>';

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(
        `SMTP transporter initialized with host: ${host}:${port}`,
      );
    } else {
      this.logger.warn(
        'No SMTP credentials configured. Welcome emails will be previewed in console logs.',
      );
    }
  }

  async sendWelcomeEmail(toEmail: string, username: string): Promise<void> {
    const subject = '🎉 Chào mừng bạn đến với WordStreak!';
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #030712; color: #f3f4f6; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #111827; border-radius: 16px; border: 1px solid #374151; overflow: hidden; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 800; }
    .header p { margin: 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 32px 24px; line-height: 1.6; }
    .feature-card { background-color: #1f2937; border-radius: 12px; padding: 16px 20px; margin-bottom: 16px; border: 1px solid #374151; }
    .feature-title { font-weight: 700; color: #818cf8; margin-bottom: 4px; font-size: 15px; }
    .feature-desc { color: #9ca3af; font-size: 13px; margin: 0; }
    .button-container { text-align: center; margin: 32px 0 16px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; }
    .footer { border-top: 1px solid #374151; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ WordStreak</h1>
      <p>Nâng tầm phản xạ từ vựng với Spaced Repetition</p>
    </div>
    <div class="content">
      <p>Xin chào <strong>${username}</strong> 👋,</p>
      <p>Chúc mừng bạn đã tạo tài khoản thành công tại <strong>WordStreak</strong>! Bạn vừa bắt đầu hành trình ghi nhớ từ vựng tiếng Anh theo phương pháp khoa học và bền vững nhất.</p>
      
      <div class="feature-card">
        <div class="feature-title">🧠 Spaced Repetition System (SRS)</div>
        <p class="feature-desc">Thuật toán lặp lại ngắt quãng thông minh giúp nhắc lại từ vựng đúng thời điểm trước khi não bộ quên lãng.</p>
      </div>

      <div class="feature-card">
        <div class="feature-title">🔥 Daily Streak Habit</div>
        <p class="feature-desc">Mỗi ngày chỉ cần 5-10 phút hoàn thành mục tiêu để duy trì chuỗi ngọn lửa Streak liên tục.</p>
      </div>

      <div class="feature-card">
        <div class="feature-title">📱 Multi-Device Synchronized</div>
        <p class="feature-desc">Đồng bộ tiến độ tức thì giữa laptop, máy tính bảng và điện thoại với phiên đăng nhập bảo mật.</p>
      </div>

      <div class="button-container">
        <a href="${this.configService.get<string>('CLIENT_URL') || 'http://localhost:5173'}" class="button">
          Bắt đầu ôn luyện ngay 🚀
        </a>
      </div>
    </div>
    <div class="footer">
      <p>Email này được gửi tự động khi bạn đăng ký tài khoản WordStreak.<br>© 2026 WordStreak App. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    try {
      if (this.transporter) {
        await this.transporter.sendMail({
          from: this.mailFrom,
          to: toEmail,
          subject,
          html: htmlContent,
        });
        this.logger.log(`Welcome email successfully sent to ${toEmail}`);
      } else {
        this.logger.log(
          `[Email Preview] To: ${toEmail} | Subject: "${subject}" | User: ${username}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${toEmail}: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }
}
