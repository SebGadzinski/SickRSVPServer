import { Mail, Response } from '@sendgrid/helpers/classes';
import { EmailData } from '@sendgrid/helpers/classes/email-address';
import sendgrid from '@sendgrid/mail';
import ejs from 'ejs';
import { Schema } from 'mongoose';
import validator from 'validator';
import Notification from '../classes/Notification';
import config from '../config';
import { Config } from '../models';
import NotificationService from './NotificationService';

const sendGridJson = config.sendGrid;

export interface IEmailService {
  validateEmail(email: string): Promise<boolean>;
  sendEmail(mail: Mail): Promise<void>;
  sendResetPasswordEmail(to: EmailData, token: string): Promise<void>;
  sendConfirmationEmail(to: EmailData, token: string): Promise<void>;
  errorHtml(errorMessage: string): string;
}

type ObjectId = Schema.Types.ObjectId;

class EmailService implements IEmailService {
  private readonly CANNOT_SEND_MAIL = 'Could not send mail';
  private readonly EMAIL_SENT_CODE = 202;

  constructor() {
    if (sendGridJson) {
      sendgrid.setApiKey(sendGridJson.apiKey);
    }
  }

  /**
   * Validates an email address using SendGrid's Email Validation API.
   * @param {string} email The email address to validate.
   * @returns {Promise<boolean>} A promise that resolves to true if the email is valid, false otherwise.
   */
  public async validateEmail(email: string): Promise<boolean> {
    try {
      // TODO replace with a actual validator
      return await validator.isEmail(email);
    } catch (error) {
      console.error('Error validating email:', error);
      return false;
    }
  }

  /**
   *
   * @param {Mail} mail Sendgrid mail object
   * @returns {Result} Result.error if there is something wrong
   */
  public async sendEmail(mail: any | Mail, force?: boolean): Promise<void> {
    try {
      if (config.sendEmailStatus === 'sending' || force) {
        const sgResult = await sendgrid.send(mail);
        if (sgResult) {
          const error = sgResult.find(
            (x) =>
              x instanceof Response && x.statusCode !== this.EMAIL_SENT_CODE
          );
          if (error) {
            console.error(JSON.stringify(error));
            throw new Error(this.CANNOT_SEND_MAIL);
          }
        }
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * Sends housewarming email to a user
   * @param to
   */
  public async sendInvitation(
    to: EmailData,
  ): Promise<void> {
    if (typeof to === 'string') {
      to = { email: to };
    }
    const inviteConfig = await Config.findOne({ name: 'invite' }).lean();

    const mail = new Mail({
      to,
      from: sendGridJson.email.noReply,
      subject: 'Your Invited!',
      html: await ejs.renderFile('src/html/emails/invite.ejs', inviteConfig.value)
    });

    await this.sendEmail(mail);
  }

  /**
   * Sends confirmation email to a user
   * @param to
   * @param token
   */
  public async sendConfirmationEmail(
    to: EmailData,
    token: string
  ): Promise<void> {
    if (typeof to === 'string') {
      to = { email: to };
    }

    const mail = new Mail({
      to,
      from: sendGridJson.email.noReply,
      subject: sendGridJson.confirmation.subject,
      html: await ejs.renderFile('src/html/emails/email-confirmation.ejs', {
        header_message: sendGridJson.confirmation.headerMessage,
        company_name: config.company,
        btn_message: sendGridJson.confirmation.btnMessage,
        btn_link: `${config.frontEndDomain}${sendGridJson.confirmation.btnLink}${token}`
      })
    });

    await this.sendEmail(mail);
  }

  /**
   * Sends reset password email to a user
   * @param to
   * @param token
   */
  public async sendResetPasswordEmail(
    to: EmailData,
    token: string
  ): Promise<void> {
    if (typeof to === 'string') {
      to = { email: to };
    }

    const mail = new Mail({
      to,
      from: sendGridJson.email.noReply,
      subject: sendGridJson.resetPassword.subject,
      html: await ejs.renderFile('src/html/emails/reset-password.ejs', {
        header_message: sendGridJson.resetPassword.headerMessage,
        company_name: config.company,
        btn_message: sendGridJson.resetPassword.btnMessage,
        btn_link: `${config.frontEndDomain}${sendGridJson.resetPassword.btnLink}${token}`
      })
    });

    await this.sendEmail(mail);
  }

  public async sendAlertEmail(
    to: EmailData,
    alert: string,
    body: string
  ): Promise<void> {
    if (typeof to === 'string') {
      to = { email: to };
    }

    const mail = new Mail({
      to,
      from: sendGridJson.email.noReply,
      subject: alert,
      html: await ejs.renderFile('src/html/emails/alert.ejs', {
        alert,
        body,
        company_name: config.company
      })
    });

    await this.sendEmail(mail);
  }

  public async sendNotificationEmail({
    to,
    title,
    header,
    body,
    link,
    btnMessage,
    appNotification,
  }: {
    to: EmailData,
    title: string,
    header: string,
    body: string,
    link: string,
    btnMessage: string,
    appNotification?: {
      id: string | ObjectId,
      notification: Notification,
    },
  }): Promise<void> {
    if (typeof to === 'string') {
      to = { email: to };
    }

    if (appNotification) {
      try {
        await NotificationService.sendNotification(
          appNotification.id,
          appNotification.notification
        );
      } catch (err) {
        console.error(err);
      }
    }

    const email: any = {
      to,
      from: sendGridJson.email.noReply,
      subject: title,
      html: await ejs.renderFile('src/html/emails/notification.ejs', {
        title,
        header,
        body,
        company_name: config.company,
        btn_link: link,
        btn_message: btnMessage
      })
    };

    const mail = new Mail(email);

    await this.sendEmail(mail);
  }

  public errorHtml(errorMessage: string): string {
    return `
        <div style="border: 1px solid #e74c3c; padding: 16px; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #f9ecec;">
            <h1 style="color: #e74c3c; font-size: 24px; border-bottom: 1px solid #e74c3c; padding-bottom: 8px;">Server Database Alert</h1>
            <p style="font-size: 16px; color: #333;">
                ${errorMessage}
            </p>
        </div>
    `;
  }
}

export default new EmailService();
