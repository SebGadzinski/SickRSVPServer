/**
 * @file Email Unit Tests For Services
 * @author Sebastian Gadzinski
 */

import { expect } from 'chai';
import sendgrid from '../../../src/configs/sendGrid.json';
import UnitTest from '../../bases/UnitTest';
// TODO: Make sure to add ts file toEmails which exports a list of strings (emails)
import toEmails from '../../data/toEmails';
import EmailService from '../../../src/services/EmailService';
import { Mail } from '@sendgrid/helpers/classes';

/**
 * Be prepared to receive some emails
 */
// TODO: Make sure the emails in sendgrid json are validated by sendgrid!
class EmailServiceTest extends UnitTest {

  constructor() {
    super('Email Service Tests');
    this.run();
  }

  run() {
    describe(this.testName, () => {
      before(() => this.startMongo(false));

      it('Send Single Email', async () => {
        let testMail = new Mail({
          from: sendgrid.email.noReply,
          to: toEmails[0],
          subject: 'TESTING SINGLE',
          text: 'Testing Single',
          html: '<p>TESTING SINGLE</p>'
        });

        await EmailService.sendEmail(testMail);
      });

      it('Send Multiple Emails', async () => {
        let testMail = new Mail({
          from: sendgrid.email.noReply,
          to: toEmails,
          subject: 'TESTING MULTIPLE',
          text: 'Testing Multiple',
          html: '<p>TESTING MULTIPLE</p>'
        });

        await EmailService.sendEmail(testMail);
      });

      it('Send Alert Email', async () => {
        await EmailService.sendAlertEmail(
          { name: 'Sebastian', email: toEmails[0] }, 'A Alert',
          `<p>Hello,</p>
            <p>This is a test alert message. Please pay attention to the following details:</p>
            <ul>
              <li>Item 1: Important information</li>
              <li>Item 2: Additional details</li>
              <li>Item 3: Final remarks</li>
            </ul>
          `
        );
      });

      it('Send Notification Email', async () => {
        await EmailService.sendNotificationEmail(
          {
            to: { name: 'Sebastian', email: toEmails[0] },
            title: 'A Title',
            header: 'A Header',
            body: 'Big Body Bob',
            link: 'https://gadzy-work.com',
            btnMessage: 'My Site'
          }
        );
      });

      it('Send Confirmation Email', async () => {
        await EmailService.sendConfirmationEmail(
          { name: 'Sebastian', email: toEmails[0] },
          'token'
        );
      });

      it('Send Reset Password Email', async () => {
        await EmailService.sendResetPasswordEmail(
          { name: 'Sebastian', email: toEmails[0] },
          'token'
        );
      });
    });
  }
}

new EmailServiceTest();
