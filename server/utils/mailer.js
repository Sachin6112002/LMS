import nodemailer from 'nodemailer';

// Configure MailerSend SMTP settings
const transporter = nodemailer.createTransport({
  host: process.env.MAILERSEND_HOST || 'smtp.mailersend.net',
  port: process.env.MAILERSEND_PORT ? parseInt(process.env.MAILERSEND_PORT) : 587,
  auth: {
    user: process.env.MAILERSEND_USER, // your MailerSend SMTP username
    pass: process.env.MAILERSEND_PASS, // your MailerSend SMTP password
  },
  secure: false, // Use TLS
});

export const sendMail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: process.env.MAILERSEND_FROM, // your verified sender address
    to,
    subject,
    html,
    text,
  };
  return transporter.sendMail(mailOptions);
};
