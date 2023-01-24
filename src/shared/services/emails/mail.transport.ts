import { BadRequestError } from '@global/helpers/error-handler';
import { config } from '@root/config';
import nodemailer from 'nodemailer';
import sendGridMail from '@sendgrid/mail';

const log = config.createLogger('mailOptions');

class MailTransport {
  public async sendEmail(receiverEmail: string, subject: string, body: string): Promise<void> {
    if (config.NODE_ENV === 'production') {
      this.productionEmailSender(receiverEmail, subject, body);
    } else {
      this.developmentEmailSender(receiverEmail, subject, body);
    }
  }

  private async developmentEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    try {
      // create reusable transporter object using the default SMTP transport
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: config.SENDER_EMAIL!, // generated ethereal user
          pass: config.SENDER_EMAIL_PASSWORD! // generated ethereal password
        }
      });

      const mailOptions = {
        from: `Chatty App <${config.SENDER_EMAIL}>`, // sender address
        to: receiverEmail, // list of receivers
        subject: subject, // Subject line
        html: body // html body
      };

      // send mail with defined transport object
      await transporter.sendMail(mailOptions);
      log.info('Development email sent successfully');
    } catch (error) {
      log.error('Error sending email development ', error);
      throw new BadRequestError('Error sending email');
    }
  }

  private async productionEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    try {
      const mailOptions = {
        from: `Chatty App <${config.SENDER_EMAIL}>`, // sender address
        to: receiverEmail, // list of receivers
        subject: subject, // Subject line
        html: body // html body
      };

      await sendGridMail.send(mailOptions);
      log.info('Production email sent successfully');
    } catch (error) {
      log.error('Error sending email production ', error);
      throw new BadRequestError('Error sending email');
    }
  }
}

export const mailTransport = new MailTransport();
