import User from '../models/User.js';
import Otp from '../models/Otp.js';
import nodemailer from 'nodemailer';

export const sendAdminOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: 'Email required' });
  const admin = await User.findOne({ email, 'publicMetadata.role': 'admin' });
  if (!admin) return res.json({ success: false, message: 'Admin not found' });

  await Otp.deleteMany({ email });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await Otp.create({ email, otp, expiresAt });

  res.json({ success: true, message: 'OTP is being sent to email.' });

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Admin OTP for Password Reset',
      text: `Your OTP is: ${otp}`,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Admin OTP email sent:', info.response);
    console.log('Mail options:', mailOptions);
  } catch (err) {
    console.error('Failed to send Admin OTP email:', err);
  }
};

export const verifyAdminOtpAndChangePassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.json({ success: false, message: 'All fields required' });
  const otpRecord = await Otp.findOne({ email, otp });
  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    return res.json({ success: false, message: 'Invalid or expired OTP' });
  }
  const admin = await User.findOne({ email, 'publicMetadata.role': 'admin' });
  if (!admin) return res.json({ success: false, message: 'Admin not found' });
  admin.password = newPassword;
  await admin.save();
  await Otp.deleteMany({ email });
  res.json({ success: true, message: 'Password changed successfully' });
};
