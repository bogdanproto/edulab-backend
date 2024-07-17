import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';
import { userError } from '../consts';
import {
  ApiError,
  createEmailHtmlContent,
  updateEmailHtmlContent,
  createResetPswHtmlContent,
} from '../helpers';

dotenv.config();

export class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendActivationEmail({
    firstName,
    email,
    activateAccountLink,
  }: {
    firstName: string;
    email: string;
    activateAccountLink: string;
  }) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Activate your account on Edulab',
      html: createEmailHtmlContent(firstName, activateAccountLink),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Message sent: ${info.messageId}`);
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (error) {
      console.error(`Error sending password to ${email}:`, error);
      throw new ApiError(userError.EMAIL_IS_NOT_SEND);
    }
  }

  async sendResetPasswordEmail({
    firstName,
    email,
    activateAccountLink,
  }: {
    firstName: string;
    email: string;
    activateAccountLink: string;
  }) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Reset Password on Edulab',
      html: createResetPswHtmlContent(firstName, activateAccountLink),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Message sent: ${info.messageId}`);
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (error) {
      console.error(`Error sending password to ${email}:`, error);
      throw new ApiError(userError.EMAIL_IS_NOT_SEND);
    }
  }

  async sendUpdateEmail({
    firstName,
    email,
  }: {
    firstName: string;
    email: string;
  }) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Your e-mail has been changed on Edulab',
      html: updateEmailHtmlContent(firstName),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Message sent: ${info.messageId}`);
    } catch (error) {
      console.error(`Error sending email to ${email}:`, error);
      throw new ApiError(userError.EMAIL_IS_NOT_SEND);
    }
  }
}
