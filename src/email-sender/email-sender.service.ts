import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  date: string;
  total: number;
  items: OrderItem[];
}

@Injectable()
export class EmailSenderService {
  constructor(private emailService: MailerService) {}

  async sendTextToEmail(
    to: string,
    subject: string,
    order: Order,
  ): Promise<string> {
    const orderDetailsHtml = `
      <h2>Order Details</h2>
      <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
      <p><strong>Total:</strong> $${order.total}</p>
      
      <h3>Items:</h3>
      <ul>
        ${order.items
          .map(
            (item) => `
          <li>${item.name}: ${item.quantity} x $${item.price}</li>
        `,
          )
          .join('')}
      </ul>
      
      <p>Thank you for your order!</p>
    `;

    const options = {
      from: 'Store <nkurt17@freeuni.edu.ge>',
      to,
      subject,
      html: orderDetailsHtml,
    };

    await this.emailService.sendMail(options);
    return 'sent successfully';
  }
}
