import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { sendMail } from '../utils/mailersendApi.js';

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

  // Respond immediately to avoid Vercel timeout
  res.json({ success: true, message: 'OTP is being sent to email.' });

  // Send OTP via email in the background
  try {
    await sendMail({
      to: email,
      subject: 'Your OTP for Password Reset',
      text: `Your OTP is: ${otp}`,
      html: `<p>Your OTP is: <b>${otp}</b></p>`,
    });
    console.log('OTP email sent to:', email);
  } catch (err) {
    console.error('Failed to send OTP email:', err);
  }
};

export const verifyOtpAndChangePassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword)
    return res.json({ success: false, message: 'All fields required' });
  const otpRecord = await Otp.findOne({ email, otp });
  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    return res.json({ success: false, message: 'Invalid or expired OTP' });
  }
  const user = await User.findOne({ email });
  if (!user) return res.json({ success: false, message: 'User not found' });
  // Assign plain password, let pre-save hook hash it
  user.password = newPassword;
  await user.save();
  await Otp.deleteMany({ email });
  res.json({ success: true, message: 'Password changed successfully' });
};
