import { Injectable } from '@nestjs/common';
import { baseEmailTemplate } from './templates/base.template';
import * as nodemailer from 'nodemailer';
import { MailTransporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: MailTransporter;

  constructor() {
    const transportConfig = {
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    };
    this.transporter = nodemailer.createTransport(transportConfig);
  }

  async sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
    const html = baseEmailTemplate({
      title: 'Reset Your Password',
      content: `
        <p>Hello ${name},</p>
        <p>We received a request to reset your password.</p>
        <p>Click the button below to set a new password. This link expires in 30 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      buttonText: 'Reset Password',
      buttonUrl: resetUrl,
    });

    await this.transporter.sendMail({
      from: {
        address: process.env.MAIL_FROM,
        name: 'SaaS HRMS',
      },
      to: [to],
      subject: 'Reset Your Password - SaaS HRMS',
      html,
    });
  }

  async sendVerificationEmail(to: string, name: string, verifyUrl: string) {
    const html = baseEmailTemplate({
      title: 'Verify Your Email',
      content: `
        <p>Hello ${name},</p>
        <p>Thanks for signing up! Please confirm your email address to activate your account.</p>
        <p>Click the button below to verify your email. This link expires in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      `,
      buttonText: 'Verify Email',
      buttonUrl: verifyUrl,
    });

    await this.transporter.sendMail({
      from: {
        address: process.env.MAIL_FROM,
        name: 'SaaS HRMS',
      },
      to: [to],
      subject: 'Verify Your Email - SaaS HRMS',
      html,
    });
  }

  async sendTestMail(to: string) {
    const html = baseEmailTemplate({
      title: 'Welcome to SaaS HRMS',
      content: ` <p>Hello,</p> <p> Your email service is working successfully. </p> <p> You can now start sending system emails. </p> `,
      buttonText: 'Visit Dashboard',
      buttonUrl: 'https://example.com',
    });
    await this.transporter.sendMail({
      from: {
        address: process.env.MAIL_FROM,
        name: 'SaaS HRMS',
      },
      to: [to],
      subject: 'Test Email',
      html,
    });
  }
}
