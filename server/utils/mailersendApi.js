// mailersendApi.js (This file is now obsolete and replaced by resendApi.js using Resend)
// You can delete this file.

// import { MailerSend } from 'mailersend';
//
// const mailerSend = new MailerSend({ apiKey: process.env.MAILERSEND_API_KEY });
//
// export async function sendMail({ to, subject, text, html }) {
//   try {
//     const response = await mailerSend.send({
//       from: process.env.MAILERSEND_FROM, // e.g. 'YourApp <noreply@yourdomain.com>'
//       to,
//       subject,
//       text,
//       html,
//     });
//     console.log('[MailerSend] Email sent successfully:', response);
//     return response;
//   } catch (error) {
//     console.error('[MailerSend] Error sending email:', error);
//     throw error;
//   }
// }
