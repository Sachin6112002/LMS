import User from '../models/User.js';
import nodemailer from 'nodemailer';
import Otp from '../models/Otp.js';
import bcrypt from 'bcryptjs';

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: 'Email required' });
  const user = await User.findOne({ email });
  if (!user) return res.json({ success: false, message: 'User not found' });

  // Remove any existing OTPs for this email
  await Otp.deleteMany({ email });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
  await Otp.create({ email, otp, expiresAt });

  // Send OTP via email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Password Reset',
    text: `Your OTP is: ${otp}`,
  });
  res.json({ success: true, message: 'OTP sent to email.' });
};

export const verifyOtpAndChangePassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.json({ success: false, message: 'All fields required' });
  const otpRecord = await Otp.findOne({ email, otp });
  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    return res.json({ success: false, message: 'Invalid or expired OTP' });
  }
  const user = await User.findOne({ email });
  if (!user) return res.json({ success: false, message: 'User not found' });
  // Hash password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();
  await Otp.deleteMany({ email });
  res.json({ success: true, message: 'Password changed successfully' });
};
