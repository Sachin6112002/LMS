import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { sendMail } from '../utils/mailersendApi.js';

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
    await sendMail({
      to: email,
      subject: 'Your Admin OTP for Password Reset',
      text: `Your OTP is: ${otp}`,
      html: `<p>Your OTP is: <b>${otp}</b></p>`,
    });
    console.log('Admin OTP email sent to:', email);
  } catch (err) {
    console.error('Failed to send Admin OTP email:', err);
  }
};

export const verifyAdminOtpAndChangePassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.json({ success: false, message: 'All fields required' });
  const otpRecord = await Otp.findOne({ email, otp });
  console.log('DEBUG OTP:', { email, otp, otpRecord, now: new Date() });
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
