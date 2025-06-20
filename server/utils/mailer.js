import nodemailer from 'nodemailer';

// Configure your SMTP settings here
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your SMTP provider
  auth: {
    user: process.env.SMTP_USER, // your email
    pass: process.env.SMTP_PASS, // your email password or app password
  },
});

export const sendMail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
};
