// utils/mailersendApi.js (now using Resend)
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail({ to, subject, text, html }) {
  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM, // e.g. 'YourApp <noreply@yourdomain.com>'
      to,
      subject,
      text,
      html,
    });
    console.log('[Resend] Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('[Resend] Error sending email:', error);
    throw error;
  }
}
