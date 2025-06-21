// utils/mailersendApi.js
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

const mailersend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

export async function sendMail({ to, subject, text, html }) {
  const emailParams = new EmailParams()
    .setFrom(new Sender(process.env.MAILERSEND_FROM, 'eSiksha'))
    .setTo([new Recipient(to, to)])
    .setSubject(subject)
    .setText(text)
    .setHtml(html);
  return mailersend.email.send(emailParams);
}
