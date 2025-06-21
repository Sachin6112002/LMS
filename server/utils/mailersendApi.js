// utils/mailersendApi.js
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

const mailersend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

export async function sendMail({ to, subject, text, html }) {
  console.log('[MailerSend] sendMail called with:', { to, subject });
  const emailParams = new EmailParams()
    .setFrom(new Sender(process.env.MAILERSEND_FROM, 'eSiksha'))
    .setTo([new Recipient(to, to)])
    .setSubject(subject)
    .setText(text)
    .setHtml(html);
  try {
    const response = await mailersend.email.send(emailParams);
    console.log('[MailerSend] Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('[MailerSend] Error sending email:', error);
    throw error;
  }
}
