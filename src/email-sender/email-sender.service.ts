import { MailerService } from '@nestjs-modules/mailer';
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class EmailSenderService {
  constructor(private emailService: MailerService) {}

  async sendTextToEmail(to, subject, text) {
    const options = {
      from: 'Gita Back Course <ketigelovani@gmail.com>',
      to,
      subject,
      text,
    };

    await this.emailService.sendMail(options);
    return 'sent successfully';
  }

  async sendHtmlToEmail(to, subject) {
    if (!to || !subject) throw new BadRequestException('not found ');
    const html = `
            <div>
                <h1 style="color: red;">random</h1>
                <a href='https://chess.com'>Click Here</a>
            </div>
        `;

    const options = {
      to,
      from: 'Gita Back Course <ketigelovani@gmail.com>',
      subject,
      html,
    };

    await this.emailService.sendMail(options);
    return 'sent successfully';
  }
}
